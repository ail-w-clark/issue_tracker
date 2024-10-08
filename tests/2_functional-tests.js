const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    this.timeout(5000); 
    let issueId = '';

    test('Create an issue with every field', (done) => {
        const issueData = {
            issue_title: 'Test Issue with All Fields',
            issue_text: 'This is a test issue that uses all fields.',
            created_by: 'John Doe',
            assigned_to: 'Jane Doe',
            status_text: 'In Progress'
        };

        chai
            .request(server)
            .post('/api/issues/projectx') 
            .send(issueData)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res.body, '_id');
                issueId = res.body._id; 
                done();
            });
    });

    test('Create an issue with only required fields', (done) => {
        const issueData = {
            issue_title: 'Test Issue with Required Fields',
            issue_text: 'This is a test issue that uses only the required fields.',
            created_by: 'John Doe'
        };

        chai
            .request(server)
            .post('/api/issues/projectx') 
            .send(issueData)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res.body, '_id');
                done();
            });
    });

    test('Create issue with missing required fields', (done) => {
        const issueData = {
            issue_title: 'Test Issue Missing Required Fields',
            issue_text: 'This issue is missing required fields.'
        };

        chai
            .request(server)
            .post('/api/issues/projectx')
            .send(issueData)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { error: 'required field(s) missing' });
                done();
            });
    });

    test('View issues on a project', (done) => {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/projectx')
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.include(res.headers['content-type'], 'application/json', 'Response is not JSON');
            assert.isArray(res.body, 'Response body is not an array');
            done();
        });
    });

    test('View issues on a project with one filter', (done) => {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/projectx?open=true')
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.include(res.headers['content-type'], 'application/json', 'Response is not JSON');
            assert.isArray(res.body, 'Response is not an array');
            done();
        });
    });

    test('View issues on a project with multiple filters', (done) => {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/projectx?open=true&&created_by=John_Doe')
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.include(res.headers['content-type'], 'application/json', 'Response is not JSON');
            assert.isArray(res.body, 'Response is not an array');
            done();
        });
    });

    test('Update one field on an issue', (done) => {
        const issueData = { 
            _id: issueId, 
            issue_text: 'Updated issue text' 
        };

        chai
            .request(server)
            .put('/api/issues/projectx') 
            .send(issueData) 
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { result: 'successfully updated', _id: issueId });
                done();
            });
    });

    test('Update multiple fields on an issue', (done) => {
        const issueData = {
            _id: issueId,
            issue_text: 'Updated issue text again',
            status_text: 'Completed'
        };

        chai
            .request(server)
            .put('/api/issues/projectx') 
            .send(issueData) 
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { result: 'successfully updated', _id: issueId });

                done();
            });
    });

    test('Return an error when _id is missing on update', (done) => {
        const issueData = { issue_text: 'Issue text without _id' };

        chai
            .request(server)
            .put('/api/issues/projectx')
            .send(issueData)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { error: 'missing _id' });
                done();
            });
    });

    test('Return an error when no fields to update are provided', (done) => {
        chai
            .request(server)
            .put('/api/issues/projectx') 
            .send({ _id: issueId })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { error: 'no update field(s) sent', _id: issueId }); 
                done();
            });
    });

    test('Return an error for invalid _id during update', (done) => {
        const issueData = { 
            _id: '670555a563f7f07855c944c1',
            issue_text: 'Updated issue text with invalid _id' 
        };

        chai
            .request(server)
            .put('/api/issues/projectx') 
            .send(issueData) 
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { error: 'could not update', _id: '670555a563f7f07855c944c1' });
                done();
            });
    });

    test('Delete an issue', (done) => {
        chai
            .request(server)
            .delete('/api/issues/projectx') 
            .send({ _id: issueId }) 
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { result: 'successfully deleted', _id: issueId });
                done();
            });
    });

    test('Return an error for invalid _id during delete', (done) => {
        chai
            .request(server)
            .delete('/api/issues/projectx') 
            .send({ _id: '670555a563f7f07855c944c1' }) 
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { error: 'could not delete', _id: '670555a563f7f07855c944c1' });
                done();
            });
    });

    test('should return an error when _id is missing during delete', (done) => {
        chai
            .request(server)
            .delete('/api/issues/projectx') 
            .send({}) 
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { error: 'missing _id' });
                done();
            });
    });
});
