require("dotenv").config();
require("pg");
const Sequelize = require("sequelize");

let sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

// MODELS
const Sector = sequelize.define(
  "Sector",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sector_name: Sequelize.STRING,
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

const Project = sequelize.define(
  "Project",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: Sequelize.STRING,
    feature_img_url: Sequelize.STRING,
    summary_short: Sequelize.TEXT,
    intro_short: Sequelize.TEXT,
    impact: Sequelize.TEXT,
    original_source_url: Sequelize.STRING,
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

// RELATIONSHIP
Project.belongsTo(Sector, { foreignKey: "sector_id" });

// FUNCTIONS
function initialize() {
  return sequelize.sync();
}

function getAllProjects() {
  return Project.findAll({ include: [Sector] });
}

function getProjectById(projectId) {
  return Project.findAll({
    where: { id: projectId },
    include: [Sector],
  }).then((projects) => {
    if (projects.length > 0) return projects[0];
    throw new Error("Unable to find requested project");
  });
}

function getProjectsBySector(sector) {
  return Project.findAll({
    include: [Sector],
    where: {
      "$Sector.sector_name$": {
        [Sequelize.Op.iLike]: `%${sector}%`,
      },
    },
  }).then((projects) => {
    if (projects.length > 0) return projects;
    throw new Error("Unable to find requested projects");
  });
}

function getAllSectors() {
  return Sector.findAll();
}

function addProject(data) {
  return Project.create({
    title: data.title,
    feature_img_url: data.feature_img_url,
    summary_short: data.summary_short,
    intro_short: data.intro_short,
    impact: data.impact,
    original_source_url: data.original_source_url,
    sector_id: data.sector_id,
  });
}

function editProject(id, data) {
  return Project.update(
    {
      title: data.title,
      feature_img_url: data.feature_img_url,
      summary_short: data.summary_short,
      intro_short: data.intro_short,
      impact: data.impact,
      original_source_url: data.original_source_url,
      sector_id: data.sector_id,
    },
    {
      where: { id },
    }
  ).then(([updatedCount]) => {
    if (updatedCount === 0) throw new Error("Project not found or unchanged.");
  }).catch((err) => {
    throw new Error(err.errors?.[0]?.message || err.message);
  });
}

function deleteProject(id) {
  return Project.destroy({
    where: { id },
  }).then((deletedCount) => {
    if (deletedCount === 0) throw new Error("Project not found.");
  }).catch((err) => {
    throw new Error(err.errors?.[0]?.message || err.message);
  });
}

module.exports = {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  getAllSectors,
  addProject,
  editProject,
  deleteProject,
  Project,
  Sector,
};

// If initial sync is needed later for bulk data loading:
// const projectData = require("../data/projectData");
// const sectorData = require("../data/sectorData");

// sequelize.sync().then(() => {
//   Promise.all(
//     sectorData.map((sector) =>
//       Sector.create({
//         id: sector.id,
//         sector_name: sector.sector_name,
//       })
//     )
//   )
//     .then(() => {
//       return Promise.all(
//         projectData.map((proj) =>
//           Project.create({
//             id: proj.id,
//             title: proj.title,
//             feature_img_url: proj.feature_img_url,
//             summary_short: proj.summary_short,
//             intro_short: proj.intro_short,
//             impact: proj.impact,
//             original_source_url: proj.original_source_url,
//             sector_id: proj.sector_id,
//           })
//         )
//       );
//     })
//     .then(() => console.log("Data inserted successfully!"))
//     .catch((err) => console.log("Error inserting data:", err));
// });
