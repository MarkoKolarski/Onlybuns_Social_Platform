import pika

def start_agency_client():
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()

    # Kreiraj queue i poveži ga na exchange
    exchange_name = 'posts_fanout_exchange'
    channel.exchange_declare(exchange=exchange_name, exchange_type='fanout')
    queue = channel.queue_declare(queue='', exclusive=True)  # Random queue name
    queue_name = queue.method.queue

    channel.queue_bind(exchange=exchange_name, queue=queue_name)

    print("Waiting for messages...")

    def callback(ch, method, properties, body):
        print(f"Received message: {body.decode()}")

    channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)
    channel.start_consuming()

if __name__ == '__main__':
    start_agency_client()
