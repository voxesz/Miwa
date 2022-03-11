module.exports = class {
	constructor (client) {
		this.client = client;
	}

	async execute (node, code, reason) {
		console.log(c.red(`🟥 | ${node.options.identifier} desconectou inesperadamente.\nClose code: ${code}.\nReason: ${reason === '' ? 'Unknown' : reason}`));
	}
};