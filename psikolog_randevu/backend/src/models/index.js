'use strict';

const { Sequelize } = require('sequelize');
require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    ...(isProd && {
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: true },
      },
    }),
  }
);

const User = require('./user')(sequelize, Sequelize.DataTypes);
const Psychologist = require('./psychologist')(sequelize, Sequelize.DataTypes);
const Availability = require('./availability')(sequelize, Sequelize.DataTypes);
const Appointment = require('./appointment')(sequelize, Sequelize.DataTypes);
const PsychologistKey = require('./psychologistKey')(sequelize, Sequelize.DataTypes);
const PatientNote = require('./patientNote')(sequelize, Sequelize.DataTypes);
const PsychologistDocument = require('./psychologistDocument')(sequelize, Sequelize.DataTypes);
const BlogPost = require('./blogPost')(sequelize, Sequelize.DataTypes);
const PasswordReset = require('./passwordReset')(sequelize, Sequelize.DataTypes);
const RefreshToken = require('./refreshToken')(sequelize, Sequelize.DataTypes);

// İlişkiler
User.hasOne(Psychologist, { foreignKey: 'userId', as: 'psychologistProfile' });
Psychologist.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Psychologist.hasMany(Availability, { foreignKey: 'psychologistId', as: 'availabilities' });
Availability.belongsTo(Psychologist, { foreignKey: 'psychologistId', as: 'psychologist' });

Psychologist.hasMany(Appointment, { foreignKey: 'psychologistId', as: 'appointments' });
Appointment.belongsTo(Psychologist, { foreignKey: 'psychologistId', as: 'psychologist' });

User.hasMany(Appointment, { foreignKey: 'userId', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Psychologist.hasOne(PsychologistKey, { foreignKey: 'psychologistId', as: 'cryptoKey' });
PsychologistKey.belongsTo(Psychologist, { foreignKey: 'psychologistId', as: 'psychologist' });

Psychologist.hasMany(PatientNote, { foreignKey: 'psychologistId', as: 'patientNotes' });
PatientNote.belongsTo(Psychologist, { foreignKey: 'psychologistId', as: 'psychologist' });

User.hasMany(PatientNote, { foreignKey: 'userId', as: 'patientNotes' });
PatientNote.belongsTo(User, { foreignKey: 'userId', as: 'patient' });

Psychologist.hasMany(PsychologistDocument, { foreignKey: 'psychologistId', as: 'documents' });
PsychologistDocument.belongsTo(Psychologist, { foreignKey: 'psychologistId', as: 'psychologist' });

Psychologist.hasMany(BlogPost, { foreignKey: 'psychologistId', as: 'blogPosts' });
BlogPost.belongsTo(Psychologist, { foreignKey: 'psychologistId', as: 'psychologist' });

User.hasMany(PasswordReset, { foreignKey: 'userId', as: 'passwordResets' });
PasswordReset.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Psychologist,
  Availability,
  Appointment,
  PsychologistKey,
  PatientNote,
  PsychologistDocument,
  BlogPost,
  PasswordReset,
  RefreshToken,
};
