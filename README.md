# POC OpenTelemetry

This repository serves as a POC for instrumenting applications with OpenTelemetry

```mermaid
graph TD;
A[dotnet api]
B[rust api]
C[opentelemetry collector]
D[jaeger]
E[application insights]
F[...]
G[...]
G --traces--> C
A --traces--> C
B --traces--> C
C --export--> E
C --export--> F
C --export--> D
```

## Run the example

```bash
docker compose up
```
## Implemented examples

- [x] Rust
- [x] Dotnet

## Work in progress

- [ ] React

## Useful links

