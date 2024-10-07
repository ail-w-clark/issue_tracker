'use strict';

const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_on: { type: String, default: () => new Date().toISOString() },
  updated_on: { type: String, default: () => new Date().toISOString() },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: "" },
  open: { type: Boolean, default: true },
  status_text: { type: String, default: "" },
  project_name: { type: String, required: true }
});

const Issue = mongoose.model('Issue', issueSchema);

const addNewIssue = (req, res) => {
  const { issue_title, issue_text, created_by } = req.body;
  const project = req.params.project || 'apitest';

  if (!issue_title || !issue_text || !created_by) {
    return res.json({ error: 'required field(s) missing' });
  } else {
    const newIssue = new Issue({
      issue_title,
      issue_text,
      created_by,
      assigned_to: req.body.assigned_to || '',
      status_text: req.body.status_text || '',
      project_name: project 
    });
    newIssue.save();
    res.json(newIssue);
  };
};

const getIssues = async (req, res) => {
  const projectName = req.params.project; 
  const query = { project_name: projectName }; 
  const issues = await Issue.find(query);

  if (issues.length === 0) {
    return res.json([]);
  }

  if (Object.keys(req.query).length > 0) {
    const filteredIssues = issues.filter(issue => {
      return Object.entries(req.query).every(([key, value]) => {
        if (issue[key] && value) {
          return String(issue[key]).toLowerCase() === String(value).toLowerCase();
        }
        return true; 
      });
    });

    return res.json(filteredIssues.length > 0 ? filteredIssues : []);
  }

  return res.json(issues);
};

module.exports = (app) => {
  app.route('/api/issues/:project')
    .get((req, res, next) => {
      let project = req.params.project;
      getIssues(req, res);
    })
    .post(addNewIssue)  
    .put((req, res) => {
      let project = req.params.project;
      res.send('PUT request successful');
    })
    .delete((req, res) => {
      let project = req.params.project;
      res.send('DELETE request successful');
    });

    app.route('/:project?')
      .post(addNewIssue);
};
