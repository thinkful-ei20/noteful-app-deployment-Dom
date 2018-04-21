'use strict';
const chai = require('chai');
const expect = chai.expect;
const chaiHTTP = require('chai-http');
const app = require('../server');

chai.use(chaiHTTP);

describe('Reality check', () => {
  it('should be saying true', () => {
    expect(true).to.be.true;
  });
  it('should return sum of 2 + 2', () => {
    expect(2+2).to.equal(4);
  });
});

describe('Express static', () => {
  it('GET request "/" should return the index page', () => {
    return chai.request(app)
      .get('/').then(res => {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });
});

describe('404 handler', () => {
  it('should reapond with a 400 when given a bad path', () => {
    return chai.request(app)
      .get('/DOES/NOT/EXIST')
      .then(res => {
        expect(res).to.have.status(404);      
      });
  });
});

describe('GET /api/notes', () => {
  it('should return a default of 10 notes', () => {
    return chai.request(app)
      .get('/api/notes').then(res => {
        expect(res.body.length).to.be.equal(10);
      });
  });
  it('should return an array', () => {
    return chai.request(app)
      .get('/api/notes').then(res => {
        expect(res.body).to.be.a('array');
      });
  });
  it('should return the array of objects with the id, title, and content', () => {
    return chai.request(app)
      .get('/api/notes').then(res => {
        res.body.map(item => expect(item).to.have.keys(['id', 'title', 'content']));
      });
  });
  it('should return correct search results for a valid query', () => {
    return chai.request(app)
      .get('/api/notes?searchTerm=gaga')
      .then(res => {
        expect(res.body).to.be.a('array');
        expect(res).to.have.status(200);
        expect(res.body.length).to.be.above(0);
        res.body.map(item => expect(item).to.have.keys(['id', 'title', 'content']));
      });
  });
  it('should return an empty array for an incorrect query', () => {
    return chai.request(app)
      .get('/api/notes?searchTerm=dfsnf33nlsne')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.length).to.be.equal(0);
      });
  });
});

describe('GET /api/notes/:id', () => {
  it('should return correct note object with the id, title, and content for a given id', () => {
    return chai.request(app)
      .get('/api/notes/1003')
      .then(res => {
        expect(res).to.be.a('object');
        expect(res.body).to.have.keys(['id', 'title', 'content']);
        expect(res).to.have.status(200);
      });
  });
  it('should respond with a 404 for an invalid id', () => {
    return chai.request(app)
      .get('/api/notes/23764')
      .then(res => {
        expect(res).to.have.status(404);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.keys(['message', 'error']);
      });
  });
});

describe('POST /api/notes', () => {
  it('should create and return a new item with location header with provided valid data', () => {
    return chai.request(app)
      .post('/api/notes')
      .send({title: 'New Note', content: 'Come on man, Im typing here.'})
      .then(res => {
        expect(res).to.have.status(201);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.keys(['id', 'title', 'content']);
        expect(res.header.location).to.be.exist;// Figure out a way to get response port number
      });
  });
  it('should return an object with a message propery `Missing title in request body` when missing the `title` field', () => {
    return chai.request(app)
      .post('/api/notes')
      .send({content: 'All work and no play.'})
      .then(res => {
        expect(res).to.have.status(400);
        expect(res).to.be.a('object');
        expect(res.body).to.have.keys(['message', 'error']);
        expect(res.body.message).to.be.equal('Missing `title` in request body');
      });
  });
});
describe('PUT /api/notes/:id', () => {
  it('should update and return a note object when given valid data', () => {
    return chai.request(app)
      .put('/api/notes/1004')
      .send({title: 'New Title', content: 'Something witty.'})
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.keys(['id', 'title', 'content']);
        expect(res.body.id).to.be.equal(1004);
      });
  });
  it('should respond with a 404 for an invalid ID', () => {
    return chai.request(app)
      .put('/api/notes/DOESNOTEXIST')
      .send({title: 'New Title', content: 'Something witty.'})
      .then(res => {
        expect(res).to.have.status(404);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.keys(['message', 'error']);
        expect(res.body.message).to.be.equal('Not Found');
      });
  });
  it('should return an object with a message property "Missing title in request body" when missing "title" field', () => {
    return chai.request(app)
      .put('/api/notes/1004')
      .send({content: 'Something witty.'})
      .then (res => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.keys(['message', 'error']);
        expect(res.body.message).to.be.equal('Missing `title` in request body');
      });
  });
});


