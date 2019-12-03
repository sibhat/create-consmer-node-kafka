const mqtt = require('mqtt');
const Kafka = require('node-rdkafka');

//<prefix>/<version>/<journey_type>/<temporal_type>/<event_type>/<transport_mode>/<operator_id>/<vehicle_number>/<route_id>/<direction_id>/<headsign>/<start_time>/<next_stop>/<geohash_level>/<geohash>/#
const topic = '/hfp/v2/journey/ongoing/vp/+/+/+/+/+/+/+/+/+/#';

const client  = mqtt.connect('mqtts://mqtt.hsl.fi:8883');

client.on('connect', function () {
  client.subscribe(topic);
  console.log('Connected');
});
 
let count = 0;

const producer = new Kafka.Producer({
  'client.id': 'vp-producer',
  'metadata.broker.list': 'kafka:9092',
  'dr_cb': true
});

producer.setPollInterval(100);

producer.connect();


producer.on('delivery-report', (err, report) => {
  // Report of delivery statistics here:
  console.log(report);
});

// Any errors we encounter, including connection errors
producer.on('event.error', err => {
  console.error('Error from producer');
  console.error(err);
})




/* lient.on('message', function (topic, message) {
    const vehicle_position = JSON.parse(message).VP;

    //Skip vehicles with invalid location
    if (!vehicle_position.lat || !vehicle_position.long) {
      return;
    }

    const route = vehicle_position.desi;
    //vehicles are identified with combination of operator id and vehicle id
    const vehicle = vehicle_position.oper + "/" + vehicle_position.veh;
    
    const position = vehicle_position.lat + "," + vehicle_position.long;
    const speed = vehicle_position.spd;

    console.log("Route "+route+" (vehicle "+vehicle+"): "+position+" - "+speed+"m/s");

    //Close connection after receiving 100 messages
    if (++count >= 100) {
      client.end(true);
    }
}); */
producer.on('ready', () => {
  client.on('message', (topic, message) => {
      try {
          const vehicle_position = JSON.parse(message);
          const key = topic;
          const value = JSON.stringify(vehicle_position);
          producer.produce(
              'vehicle-positions',
              null,
              Buffer.from(value),
              key,
              Date.now()
          );
      } catch (err) {
          client.end(true);
          console.error('A problem occurred when sending our message');
          console.error(err);
      }
  });
});


