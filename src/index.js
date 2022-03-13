const Client = require('./structures/Client');
const { connect } = require('mongoose');
const { Vulkava } = require('vulkava');

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

	client.music = new Vulkava({
		nodes: [
			{
				id: 'Cosmos',
				hostname: String(process.env.USALAVALINKHOST),
				port: 80,
				password: String(process.env.LAVALINKPASSWORD),
				region: 'USA',
				resumeKey: 'Suki',
				resumeTimeout: 5 * 60000,
				maxRetryAttempts: 10,
				retryAttemptsInterval: 3000,
				secure: false
			},
			{
				id: 'Andromeda',
				hostname: String(process.env.EULAVALINKHOST),
				port: 80,
				password: String(process.env.LAVALINKPASSWORD),
				region: 'EU',
				resumeKey: 'Suki',
				resumeTimeout: 5 * 60000,
				maxRetryAttempts: 10,
				retryAttemptsInterval: 3000,
				secure: false
			}
		],
		sendWS: (guildId, payload) => {
			client.guilds.cache.get(guildId)?.shard.send(payload);
		},
		spotify: {
			clientId: String(process.env.SPOTIFYCLIENTID),
			clientSecret: String(process.env.SPOTIFYCLIENTSECRET)
		},
		unresolvedSearchSource: 'youtube'
	});

process.on('uncaughtException', (err) => {
	console.error(err);
});

process.on('unhandledRejection', (err) => {
	console.error(err);
});

client.onLoad(client);

client.login(process.env.TOKEN);