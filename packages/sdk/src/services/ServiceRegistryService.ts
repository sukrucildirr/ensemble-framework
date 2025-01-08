import { ethers } from "ethers";
import { Service } from "../types";

export class ServiceRegistryService {
	 private serviceRegistry: ethers.Contract;
	  
	  constructor(serviceRegistry: ethers.Contract) {
		this.serviceRegistry = serviceRegistry;
	}

	async registerService(service: Service): Promise<void> {
		try {
			console.log(`Registering service: ${service.name}`);

			const tx = await this.serviceRegistry.registerService(service.name, service.category, service.description);
			console.log(`Transaction sent for service ${service.name}: ${tx.hash}`);

			const receipt = await tx.wait();
			console.log(`Transaction confirmed for service ${service.name}: ${receipt.transactionHash}`);
	  
		} catch(error) {
			console.error(`Error registering service ${service.name}:`, error);

			throw error;
		}
	}

}