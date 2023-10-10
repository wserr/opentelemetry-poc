use std::{convert::Infallible, net::SocketAddr};

use hyper::{
    service::{make_service_fn, service_fn},
    Body, Method, Request, Response, Server,
};
use opentelemetry::{
    global,
    sdk::Resource,
    trace::{Span, SpanKind, Tracer},
    KeyValue,
};
use opentelemetry_otlp::WithExportConfig;
use rand::Rng;

#[tokio::main]
async fn main() {
    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));

    let make_svc = make_service_fn(|_conn| async { Ok::<_, Infallible>(service_fn(handle)) });

    let server = Server::bind(&addr).serve(make_svc);

    opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(
            opentelemetry_otlp::new_exporter()
                .tonic()
                .with_endpoint("http://opentelemetry-collector:4317"),
        )
        .with_trace_config(
            opentelemetry::sdk::trace::config().with_resource(Resource::new(vec![KeyValue::new(
                opentelemetry_semantic_conventions::resource::SERVICE_NAME,
                "rust-api",
            )])),
        )
        .install_batch(opentelemetry::runtime::Tokio)
        .unwrap();

    println!("Listening on {addr}");
    if let Err(e) = server.await {
        eprintln!("server error: {e}");
    }

    opentelemetry::global::shutdown_tracer_provider();
}

async fn handle(req: Request<Body>) -> Result<Response<Body>, Infallible> {
    let tracer = global::tracer("dice_server");

    let mut span = tracer
        .span_builder(format!("{} {}", req.method(), req.uri().path()))
        .with_kind(SpanKind::Server)
        .start(&tracer);

    let mut response = Response::new(Body::empty());

    if let (&Method::GET, "/rolldice") = (req.method(), req.uri().path()) {
        span.add_event("processing...", vec![KeyValue::new("Status", "Started")]);
        let random_number = rand::thread_rng().gen_range(1..7);
        *response.body_mut() = Body::from(random_number.to_string());
        span.add_event(
            "done processing.",
            vec![KeyValue::new("Status", "Finished")],
        );
    }
    Ok(response)
}
