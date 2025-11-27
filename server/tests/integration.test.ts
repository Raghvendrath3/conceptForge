import request from 'supertest';
import app from '../src/app';
import User from '../src/models/User';
import Node from '../src/models/Node';
import mongoose from 'mongoose';

// Mock Mongoose models
jest.mock('../src/models/User');
jest.mock('../src/models/Node');
jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  connect: jest.fn().mockResolvedValue(true),
  connection: {
    close: jest.fn().mockResolvedValue(true),
    dropDatabase: jest.fn().mockResolvedValue(true),
  },
}));

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (User.create as jest.Mock).mockResolvedValue({
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      settings: {},
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.status).toEqual(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
  });

  it('should login the user', async () => {
    (User.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: '$2a$10$hashedpassword', // Mocked hash
        comparePassword: jest.fn().mockResolvedValue(true),
      }),
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty('accessToken');
  });
});

describe('Node Endpoints', () => {
  let token: string;

  beforeAll(async () => {
    // Mock login for token
    (User.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'user123',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(true),
      }),
    });
    
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    token = res.body.accessToken;
  });

  it('should create a new node', async () => {
    (Node.create as jest.Mock).mockResolvedValue({
      _id: 'node123',
      title: 'Test Node',
      type: 'concept',
      bodyMarkdown: '# Hello World',
      version: 1,
      ownerId: 'user123'
    });

    const res = await request(app)
      .post('/api/nodes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Node',
        type: 'concept',
        bodyMarkdown: '# Hello World'
      });

    expect(res.status).toEqual(201);
    expect(res.body).toHaveProperty('title', 'Test Node');
  });

  it('should get all nodes', async () => {
    (Node.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        { _id: 'node1', title: 'Node 1' },
        { _id: 'node2', title: 'Node 2' }
      ])
    });

    const res = await request(app)
      .get('/api/nodes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toEqual(200);
    expect(res.body.length).toBe(2);
  });
});
