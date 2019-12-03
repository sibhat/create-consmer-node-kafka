const Kafka = require('node-rdkafka');

let count = 0;

const consumer = new Kafka.KafkaConsumer({
  'group.id': 'vp-consumer',
  'metadata.broker.list': 'kafka:9092',
  'offset_commit_cb': function(err, topicPartitions) {
 
    if (err) {
      // There was an error committing
      console.error(err);
    } else {
      // Commit went through. Let's log the topic partitions
      console.log(topicPartitions);
    }
 
  }
}, {});


consumer.connect();


// Any errors we encounter, including connection errors
consumer.on('event.error', err => {
  console.error('Error from consumer');
  console.error(err);
})



consumer
  .on('ready', function() {
    // Subscribe to the librdtesting-01 topic
    // This makes subsequent consumes read from that topic.
    console.log('subscribing to a topic');
    consumer.subscribe(['vehicle-positions']);
 
    // Read one message every 1000 milliseconds
    setInterval(function() {
      consumer.consume(1);
    }, 1000);
  })
  .on('data', function(data) {
    console.log('Message found!  Contents below.');
    console.log(data.value.toString());
  });


