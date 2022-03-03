const Client = require('./structures/Client');
const { connect } = require('mongoose');

const client = new Client({
	intents: 32767,
  });

connect(process.env.DATABASE, {})
	.then(() => {
		console.log('🟩 | Database conectada com sucesso.')
	})
	.catch((e) => {
		console.error(`🟥 | Ocorreu um erro na Database: ${e}`);
	});

process.on('uncaughtException', (err) => {
	console.error(err);
});

process.on('unhandledRejection', (err) => {
	console.error(err);
});

client.onLoad(client);

client.login(process.env.TOKEN);