const { getApplicationById, updateApplicationStatus } = require("../model/applicationModel");
const {
  scheduleInterview,
  listInterviewsByApplication,
  getAllInterviews,
  getInterviewsByRecruiter,
  getInterviewsByApplicant,
  getInterviewById,
  updateInterview,
  deleteInterview,
} = require("../model/interviewModel");
const { createAuditLog } = require("../model/auditLogModel");

const schedule = async (req, res) => {
  const applicationId = Number(req.params.applicationId);
  if (!applicationId) {
    return res.status(400).json({ success: false, message: "applicationId tidak valid." });
  }

  const { scheduledAt, scheduled_at, meetingLink, meeting_link, location, notes } = req.body;
  const scheduled = scheduledAt || scheduled_at;
  if (!scheduled) {
    return res.status(400).json({
      success: false,
      message: "scheduledAt wajib diisi (format: YYYY-MM-DD HH:MM:SS).",
    });
  }

  try {
    const application = await getApplicationById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: "Lamaran tidak ditemukan." });
    }

    const interviewId = await scheduleInterview({
      applicationId,
      scheduledAt: scheduled,
      meetingLink: meetingLink || meeting_link,
      location: location || "Online",
      notes: notes || null,
    });

    if (application.status !== "Interview") {
      await updateApplicationStatus({ id: applicationId, status: "Interview" });
      await createAuditLog({
        actorUserId: req.user.id,
        entityType: "application",
        entityId: applicationId,
        action: "status_change",
        fromStatus: application.status,
        toStatus: "Interview",
        meta: { reason: "interview_scheduled" },
      });
    }

    await createAuditLog({
      actorUserId: req.user.id,
      entityType: "interview",
      entityId: interviewId,
      action: "schedule",
      meta: { applicationId },
    });

    res.status(201).json({
      success: true,
      message: "Jadwal interview berhasil dibuat.",
      data: { id: interviewId, applicationId },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const listByApplication = async (req, res) => {
  const applicationId = Number(req.params.applicationId);
  if (!applicationId) {
    return res.status(400).json({ success: false, message: "applicationId tidak valid." });
  }

  try {
    const application = await getApplicationById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: "Lamaran tidak ditemukan." });
    }

    const interviews = await listInterviewsByApplication(applicationId);
    res.json({ success: true, total: interviews.length, data: interviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const rows =
      req.user.role === "admin"
        ? await getAllInterviews()
        : await getInterviewsByRecruiter(req.user.id);

    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMyInterviews = async (req, res) => {
  try {
    const rows = await getInterviewsByApplicant(req.user.id);
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ success: false, message: "id tidak valid." });
  }

  const { scheduledAt, scheduled_at, meetingLink, meeting_link, location, notes } = req.body;
  const scheduled = scheduledAt || scheduled_at;
  if (!scheduled) {
    return res.status(400).json({ success: false, message: "scheduledAt wajib diisi." });
  }

  try {
    const interview = await getInterviewById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Jadwal interview tidak ditemukan." });
    }

    await updateInterview(id, {
      scheduledAt: scheduled,
      meetingLink: meetingLink || meeting_link,
      location,
      notes,
    });
    res.json({ success: true, message: "Jadwal interview berhasil diupdate." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ success: false, message: "id tidak valid." });
  }

  try {
    const interview = await getInterviewById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Jadwal interview tidak ditemukan." });
    }

    await deleteInterview(id);
    res.json({ success: true, message: "Jadwal interview berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { schedule, listByApplication, getAll, getMyInterviews, update, remove };
