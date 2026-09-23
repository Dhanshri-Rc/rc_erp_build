import { Router } from 'express';
import { protect, allow } from '../middleware/auth.js';
import { journals, articles, issues, createJournal, updateJournal, deleteJournal, createArticle, updateArticle, deleteArticle, updateArticlePositions, createIssue } from '../controllers/journalController.js';

const r=Router();
r.use(protect);
r.get('/journals',journals);
r.get('/articles',articles);
r.get('/issues',issues);
r.post('/journals',allow('admin'),createJournal);
r.route('/journals/:id').put(allow('admin'),updateJournal).delete(allow('admin'),deleteJournal);
r.post('/articles',allow('admin'),createArticle);
r.route('/articles/:id').put(allow('admin'),updateArticle).delete(allow('admin'),deleteArticle);
r.patch('/articles/:id/positions',allow('admin'),updateArticlePositions);
r.post('/issues',allow('admin'),createIssue);
export default r;
