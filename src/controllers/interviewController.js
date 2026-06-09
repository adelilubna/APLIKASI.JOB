const { Application, Interview, AuditLog, User, Job, Company } = require("../model/index");

const schedule = async (req, res) => {
  const applicationId = Number(req.params.applicationId);
  if (!applicationId) {
    return res.status(400).json({ success: false, message: "applicationId tidak valid." });
  }

  const { scheduledAt, scheduled_at, meetingLink, meeting_link, location, notes } = req.body;
  const scheduled = scheduledAt || scheduled_at;
  if (!scheduled) {
    return res.status(400).json({ success: false, message: "scheduledAt wajib diisi (format: YYYY-MM-DD HH:MM:SS)." });
  }

  try {
    const application = await Application.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: "Lamaran tidak ditemukan." });
    }

    const interview = await Interview.create({
      application_id: applicationId,
      scheduled_at: scheduled,
      meeting_link: meetingLink || meeting_link || null,
      location: location || "Online",
      notes: notes || null,
    });

    if (application.status !== "Interview") {
      const prevStatus = application.status;
      await application.update({ status: "Interview" });
      await AuditLog.create({
        actor_user_id: req.user.id,
        entity_type: "application",
        entity_id: applicationId,
        action: "status_change",
        from_status: prevStatus,
        to_status: "Interview",
        meta: { reason: "interview_scheduled" },
      });
    }

    await AuditLog.create({
      actor_user_id: req.user.id,
      entity_type: "interview",
      entity_id: interview.id,
      action: "schedule",
      meta: { applicationId },
    });

    res.status(201).json({
      success: true,
      message: "Jadwal interview berhasil dibuat.",
      data: { id: interview.id, applicationId },
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
    const application = await Application.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: "Lamaran tidak ditemukan." });
    }

    const interviews = await Interview.findAll({
      where: { application_id: applicationId },
      order: [["scheduled_at", "ASC"]],
    });
    res.json({ success: true, total: interviews.length, data: interviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const includeChain = [
      {
        model: Application,
        as: "application",
        attributes: ["id", "status", "applicant_user_id", "job_id"],
        include: [
          { model: User, as: "applicant", attributes: ["id", "email"] },
          {
            model: Job,
            as: "job",
            attributes: ["id", "title", "company_id"],
            include: [{ model: Company, as: "company", attributes: ["id", "name", "owner_user_id"] }],
          },
        ],
      },
    ];

    let rows;
    if (req.user.role === "admin") {
      rows = await Interview.findAll({ include: includeChain, order: [["scheduled_at", "ASC"]] });
    } else {
      // recruiter: only their company's interviews
      rows = await Interview.findAll({ include: includeChain, order: [["scheduled_at", "ASC"]] });
      rows = rows.filter((i) => i.application?.job?.company?.owner_user_id === req.user.id);
    }

    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMyInterviews = async (req, res) => {
  try {
    const rows = await Interview.findAll({
      include: [
        {
          model: Application,
          as: "application",
          where: { applicant_user_id: req.user.id },
          attributes: ["id", "status"],
          include: [
            {
              model: Job,
              as: "job",
              attributes: ["id", "title"],
              include: [{ model: Company, as: "company", attributes: ["id", "name"] }],
            },
          ],
        },
      ],
      order: [["scheduled_at", "ASC"]],
    });
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "id tidak valid." });

  const { scheduledAt, scheduled_at, meetingLink, meeting_link, location, notes } = req.body;
  const scheduled = scheduledAt || scheduled_at;
  if (!scheduled) {
    return res.status(400).json({ success: false, message: "scheduledAt wajib diisi." });
  }

  try {
    const interview = await Interview.findByPk(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Jadwal interview tidak ditemukan." });
    }
    await interview.update({
      scheduled_at: scheduled,
      meeting_link: meetingLink || meeting_link || null,
      location: location || null,
      notes: notes || null,
    });
    res.json({ success: true, message: "Jadwal interview berhasil diupdate." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "id tidak valid." });

  try {
    const interview = await Interview.findByPk(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Jadwal interview tidak ditemukan." });
    }
    await interview.destroy();
    res.json({ success: true, message: "Jadwal interview berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { schedule, listByApplication, getAll, getMyInterviews, update, remove };
