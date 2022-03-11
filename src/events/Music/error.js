module.exports = class {
	constructor (client) {
		this.client = client;
	}

	async execute (node, error) {
		console.log(`🟥 | Ocorreu um erro no Node ${node.identifier}.\nErro: ${error.message}`);
		if (error.message.startsWith('Unable to connect after')) this.reconnect(node);
	}

	async reconnect (node) {
		node.disconnect();
		this.nodes.splice(this.nodes.indexOf(node), 1);

		const newNode = new Node(this, {
		  id: String(node.identifier),
		  hostname: node.options.hostname,
		  port: node.options.port,
		  password: node.options.password,
		  maxRetryAttempts: 10,
		  retryAttemptsInterval: 3000,
		  secure: false,
		  region: node.options.region
		});

		this.nodes.push(newNode);

		newNode.connect();
	  }
};