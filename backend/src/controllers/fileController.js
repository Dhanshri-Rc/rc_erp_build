import fs from 'fs';
import path from 'path';
import Payment from '../models/Payment.js';
import AuthorshipSale from '../models/AuthorshipSale.js';
import PublicationService from '../models/PublicationService.js';
import Lead from '../models/Lead.js';
import { asyncHandler } from '../utils/http.js';

const uploadRoot = path.resolve(process.env.UPLOAD_DIR || 'uploads');

export const downloadFile = asyncHandler(async (req, res) => {
  const filename = path.basename(req.params.filename);
  if (!filename || filename !== req.params.filename) {
    return res.status(400).json({ success: false, message: 'Invalid file name', errors: [] });
  }
  const escaped = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const storedPath = { $regex: `(^|[\\\\/])${escaped}$` };
  const role = req.user.role;
  let allowed = role === 'admin';
  if (!allowed && role === 'finance') allowed = Boolean(await Payment.exists({ proof: storedPath }));
  if (!allowed && role === 'sales') {
    const userId = req.user._id;
    allowed = Boolean(
      await Payment.exists({ proof: storedPath, submittedBy: userId }) ||
      await AuthorshipSale.exists({ paymentProof: storedPath, createdBy: userId }) ||
      await PublicationService.exists({ paymentProof: storedPath, createdBy: userId }) ||
      await Lead.exists({ attachment: storedPath, $or: [{ createdBy: userId }, { assignedTo: userId }] })
    );
  }
  if (!allowed) return res.status(404).json({ success: false, message: 'File not found', errors: [] });
  const fullPath = path.join(uploadRoot, filename);
  if (!fs.existsSync(fullPath)) return res.status(404).json({ success: false, message: 'File not found', errors: [] });
  res.setHeader('Cache-Control', 'private, no-store');
  return res.sendFile(fullPath);
});
