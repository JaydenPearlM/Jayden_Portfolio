// No dotenv here—just test the literal string
const mongoose = require('mongoose');

const uri = 'mongodb://devfolio_user:Yasumi90@\
cluster0-shard-00-00.0cypjop.mongodb.net:27017,\
cluster0-shard-00-01.0cypjop.mongodb.net:27017,\
cluster0-shard-00-02.0cypjop.mongodb.net:27017/devfolio?\
ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Direct test: Connected!');
  process.exit(0);
})
.catch(err => {
  console.error('❌ Direct test: Connection error:\n', err);
  process.exit(1);
});
