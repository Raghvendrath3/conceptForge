# ConceptForge API Documentation

## Authentication

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "user@example.com", "password": "password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

## Nodes

### Create Node
*Requires Bearer Token*
```bash
curl -X POST http://localhost:5000/api/nodes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "My Concept", "type": "concept", "bodyMarkdown": "# Hello World"}'
```

### Get All Nodes
```bash
curl -X GET http://localhost:5000/api/nodes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Node
```bash
curl -X PUT http://localhost:5000/api/nodes/NODE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Concept", "bodyMarkdown": "# Updated Content"}'
```

### Delete Node
```bash
curl -X DELETE http://localhost:5000/api/nodes/NODE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
