import { BigNumberish, ethers } from "ethers";
import { AgentData, ContractConfig, Proposal, TaskData, TaskCreationParams, Service } from "./types";
import { ContractService } from "./services/ContractService";
import { TaskService } from "./services/TaskService";
import { AgentService } from "./services/AgentService";
import { ProposalService } from "./services/ProposalService";
import { ServiceRegistryService } from "./services/ServiceRegistryService";
import TaskRegistryABI from './abi/TaskRegistry.abi.json';
import AgentRegistryABI from './abi/AgentsRegistry.abi.json';

export class Ensemble {
  protected contractService: ContractService;
  private taskService: TaskService;
  private agentService: AgentService;
  private proposalService: ProposalService;
  private serviceRegisterService: ServiceRegistryService;

  constructor(config: ContractConfig, signer: ethers.Signer) {
    console.log('Config Params:', {
      network: {
        rpcUrl: config.network.rpcUrl,
        chainId: config.network.chainId,
        name: config.network.name
      },
      taskRegistryAddress: config.taskRegistryAddress,
      agentRegistryAddress: config.agentRegistryAddress
    });

    this.contractService = new ContractService(
      new ethers.JsonRpcProvider(config.network.rpcUrl),
      signer
    );

    // Initialize services
    const taskRegistry = this.contractService.createContract(
      config.taskRegistryAddress,
      TaskRegistryABI
    );
    
    const agentRegistry = this.contractService.createContract(
      config.agentRegistryAddress,
      AgentRegistryABI
    );

    const serviceRegistry = this.contractService.createContract(
      config.serviceRegistryAddress,
      AgentRegistryABI
    );

    this.taskService = new TaskService(taskRegistry);
    this.agentService = new AgentService(agentRegistry, signer);
    this.proposalService = new ProposalService({
      projectId: 'ensemble-ai-443111',
      topicName: 'ensemble-tasks',
      taskRegistry: taskRegistry
    });
    this.serviceRegisterService = new ServiceRegistryService(serviceRegistry);
  }
  
  async start() {
    this.taskService.subscribe()
    await this.proposalService.setupSubscription(await this.agentService.getAddress());
  }

  async stop() {
    
  }

  /**
   * Creates a new task.
   * @param {TaskCreationParams} params - The parameters for task creation.
   * @returns {Promise<TaskData>} A promise that resolves to the task ID.
   */
  async createTask(params: TaskCreationParams): Promise<TaskData> {
    return this.taskService.createTask(params);
  }

  /**
   * Gets data for a specific task.
   * @param {string} taskId - The ID of the task.
   * @returns {Promise<TaskData>} A promise that resolves to the task data.
   */
  async getTaskData(taskId: string): Promise<TaskData> {
    return this.taskService.getTaskData(taskId);
  }

  /**
   * Gets tasks by owner.
   * @param {string} owner - The owner of the tasks.
   * @returns {Promise<string[]>} A promise that resolves to the task IDs.
   */
  async getTasksByOwner(owner: string): Promise<TaskData[]> {
    return this.taskService.getTasksByOwner(owner);
  }

  /**
   * Completes a task.
   * @param {BigNumberish} taskId - The ID of the task.
   * @param {string} result - The result of the task.
   * @returns {Promise<void>} A promise that resolves when the task is completed.
   */
  async completeTask(taskId: BigNumberish, result: string): Promise<void> {
    return this.taskService.completeTask(taskId, result);
  }
  
  /**
   * Registers a new agent.
   * @param {string} name - The name of the agent.
   * @param {string} uri - The uri for the agent.
   * @param {string} owner - The owner of the agent.
   * @param {string} address - The address of the agent.
   * @param {Proposal[]} proposals - The proposals for the agent.
   * @returns {Promise<string>} A promise that resolves to the agent address.
   */
  async registerAgent(name: string, uri: string, owner: string, address: string, proposals: Proposal[]): Promise<string> {
    return this.agentService.registerAgent(name, uri, owner, address, proposals);
  }

  /**
   * Gets the address of the agent.
   * @returns {Promise<string>} A promise that resolves to the agent address.
   */
  async getWalletAddress(): Promise<string> {
    return this.agentService.getAddress();
  }

  /**
   * Gets data for a specific agent.
   * @param {string} agentAddress - The address of the agent.
   * @returns {Promise<AgentData>} A promise that resolves to the agent data.
   */
  async getAgentData(agentId: string): Promise<AgentData> {
    return this.agentService.getAgentData(agentId);
  }

   /**
   * Gets all the agents for a specific service.
   * @param {string} serviceId - The id of the service.
   * @returns {Promise<AgentData>} A promise that resolves to a list of agent data.
   */
   async getAgentsByServiceId(serviceId: string): Promise<AgentData[]> {
    return this.agentService.getAgentsByServiceId(serviceId);
  }

  /**
   * Checks if an agent is registered.
   * @param {string} agentAddress - The address of the agent.
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating if the agent is registered.
   */
  async isAgentRegistered(agentId: string): Promise<boolean> {
    return this.agentService.isAgentRegistered(agentId);
  }


  /**
   * Sends a proposal for a task.
   * @param {string} taskId - The ID of the task.
   * @param {BigNumberish} price - The price of the proposal.
   * @returns {Promise<void>} A promise that resolves when the proposal is sent.
   */
  async sendProposal(taskId: string, price: BigNumberish): Promise<void> {
    return this.proposalService.sendProposal(taskId, await this.agentService.getAddress(), price);
  }

  /**
   * Gets proposals for a task.
   * @param {string} taskId - The ID of the task.
   * @returns {Promise<string[]>} A promise that resolves to an array of proposal IDs.
   */
  async getProposals(taskId: string): Promise<string[]> {
    return this.proposalService.getProposals(taskId);
  }

  /**
   * Approves a proposal for a task.
   * @param {BigNumberish} taskId - The ID of the task.
   * @param {Object} proposal - The proposal object.
   * @param {BigNumberish} proposal.id - The ID of the proposal.
   * @param {BigNumberish} proposal.price - The price of the proposal.
   * @param {BigNumberish} proposal.taskId - The ID of the task.
   * @param {string} proposal.agent - The agent address.
   * @returns {Promise<void>} A promise that resolves when the proposal is approved.
   */
  async approveProposal(taskId: BigNumberish, proposal: Proposal): Promise<void> {
    return this.proposalService.approveProposal(taskId, proposal);
  }

  async setOnNewTaskListener(listener: (task: TaskData) => void) {
    return this.taskService.setOnNewTaskListener(listener);
  }

  async setOnNewProposalListener(listener: (proposal: Proposal) => void) {
    return this.proposalService.setOnNewProposalListener(listener);
  }

  async registerService(service: Service): Promise<void> {
    return this.serviceRegisterService.registerService(service);
  }
} 
