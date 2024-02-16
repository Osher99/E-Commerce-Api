module.exports = ({ env }) => ({
  // here might be other things already, but add the next part
  email: {
    config:{
      provider: 'sendgrid',
      providerOptions: {
        apiKey: env('SEND_GRID_API_KEY')
      },
      settings: {
        defaultFrom: 'zzrerogames@gmail.com',
        defaultReplyTo: 'zzrerogames@gmail.com'
      },
    },
  }
});
