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

const updateIssue = async (req, res) => {
  try {
    if (!req.body._id) {
      return res.json({ error: 'missing _id', _id: req.body._id });
    }

    const updateFields = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text'];

    const hasUpdateField = updateFields.some(field => req.body[field]);

    if (!hasUpdateField) {
      return res.json({ error: 'no update field(s) sent', _id: req.body._id });
    }

    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(([key, value]) => value !== "")
    );

    updateData.updated_on = new Date().toISOString();

    const issue = await Issue.findByIdAndUpdate(
      req.body._id,
      updateData,
      { new: true } 
    );

    if (!issue) {
      return res.json({ error: 'could not update', _id: req.body._id });
    }

    res.json({ result: 'successfully updated', _id: req.body._id });

  } catch (err) {
    console.error(err); 
    return res.json({ error: 'could not update', _id: req.body._id });
  }
};

const deleteIssue = async (req, res) => {
  try {
    if (!req.body._id) {
      return res.json({ error: 'missing _id' });
    }

    const issue = await Issue.findByIdAndDelete(req.body._id);

    if (!issue) {
      return res.json({ error: 'could not delete', _id: req.body._id });
    }

    res.json({ result: 'successfully deleted', _id: req.body._id });
  } catch (err) {
    return res.json({ error: 'could not delete', _id: req.body._id });
  }
};


module.exports = (app) => {
  app.route('/api/issues/:project')
    .get(getIssues)
    .post(addNewIssue)  
    .put(updateIssue)
    .delete(deleteIssue);

    app.route('/:project?')
      .post(addNewIssue);
};
