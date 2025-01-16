import { Ensemble } from "../src";
import { AgentAlreadyRegisteredError, ServiceNotRegisteredError } from "../src/errors";
import { setupSdk } from "./utils";


describe("AgentService Integration Tests", () => {
    // let provider: ethers.JsonRpcProvider;
    // let signer: ethers.Wallet;
    // let agentService: AgentService;
	// let serviceRegistryService: ServiceRegistryService;
    // let agentRegistry: ethers.Contract;
	// let serviceRegistry: ethers.Contract;
	let sdk: Ensemble;

	beforeEach(async () => {
	  sdk = setupSdk();
	  await sdk.start();
  });

    // beforeAll(async () => {
    //     provider = new ethers.JsonRpcProvider(process.env.NETWORK_RPC_URL);
    //     signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

	// 	const serviceRegistryAddress = process.env.SERVICE_REGISTRY_ADDRESS!;
	// 	const serviceRegistryAbi = [
    //         "function registerService(string name, string category, string description) public returns (tuple(string name, string category, string description))",
    //         "function isServiceRegistered(string name) public view returns (bool)"
    //     ];
    //     serviceRegistry = new ethers.Contract(serviceRegistryAddress, serviceRegistryAbi, signer);
    //     serviceRegistryService = new ServiceRegistryService(serviceRegistry);

    //     const agentRegistryAddress = process.env.AGENT_REGISTRY_ADDRESS!;
    //     const agentRegistryAbi = [
    //         "function registerAgent(string memory name, string memory agentUri, address agent, string memory serviceName, uint256 servicePrice) public returns (bool)",
    //         "event AgentRegistered(address indexed agent, address indexed owner, string name, string uri)",
    //     ];

    //     agentRegistry = new ethers.Contract(agentRegistryAddress, agentRegistryAbi, signer);
    //     agentService = new AgentService(agentRegistry, signer);

	// 	const service = {
    //         name: "Bull-Post",
    //         category: "Social Service",
    //         description: "This is a KOL service."
    //     };

    //     const isRegistered = await serviceRegistry.isServiceRegistered(service.name);
	// 	console.log(`Service ${service.name} is registered: ${isRegistered}`);
    //     if (!isRegistered) {
	// 		console.log(`Service ${service.name} is not registered. Registering...`);
    //         await sdk.registerService(service);
    //     }
    // });

    it("should fail to register an agent without a service", async () => {
        const agentName = "Agent-test";
        const agentUri = "https://example.com";
        const agentAddress = process.env.AGENT_ADDRESS!;
		const serviceName = "Bull-Post-test";
		const servicePrice = 100;

        await expect(sdk.registerAgent(agentAddress, agentName, agentUri, serviceName, servicePrice))
            .rejects
            .toThrow(ServiceNotRegisteredError);
    });

    it("should register an agent successfully", async () => {

        const agentName = "Agent1";
        const agentUri = "https://example.com";
        const agentAddress = process.env.AGENT_ADDRESS!;
		const serviceName = "Bull-Post";
		const servicePrice = 100;

        await sdk.registerService({
            name: serviceName,
            category: "Social Service",
            description: "This is a KOL service."
        });

        const isRegistered = await sdk.registerAgent(agentAddress, agentName, agentUri, serviceName, servicePrice);

        expect(isRegistered).toEqual(true);

        const agentData = await sdk.getAgent(agentAddress);

        expect(agentData.name).toEqual(agentName);
        expect(agentData.uri).toEqual(agentUri);
        // TODO: fix this
        // expect(agentData.proposals[0].price).toEqual(serviceName);
        // expect(agentData.proposals[0].agent).toEqual(servicePrice);
    });

    it("should not register the same agent twice", async () => {
        const agentName = "Agent-double-register";
        const agentUri = "https://example.com";
        const agentAddress = process.env.AGENT_ADDRESS!;
		const serviceName = "Bull-Post";
		const servicePrice = 100;
        
        await expect(sdk.registerAgent(agentAddress, agentName, agentUri, serviceName, servicePrice))
            .rejects
            .toThrow(AgentAlreadyRegisteredError);

        // const isRegistered = await sdk.registerAgent(agentName, agentUri, agentAddress, serviceName, servicePrice);

        // expect(isRegistered).toEqual(true);

        // await expect(sdk.registerAgent(agentName, agentUri, agentAddress, serviceName, servicePrice))
        //     .rejects
        //     .toThrow(AgentAlreadyRegisteredError);
    });
});
