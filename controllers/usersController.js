import crypto from 'crypto';
import { UsersModel, HistoryTodayModel, HistoryModel } from '../models';
import { createNewEntity, mergeEntity } from '../utils/modelUtils';
import { errorMessages } from '../utils/errorUtils';
import { comparePassword } from '../utils/password';
import { sendMail } from '../utils/mailUtils';

export async function getUsers(usernames) {
  try {
    let users = [];
    if (usernames !== undefined) {
      users = await UsersModel.find({
        'username': {
          $in: usernames.split(',')
        }
      })
    }
    else {
      users = await UsersModel.find();
    }

    const userIds = users.map(user => user.id);
    const history = await HistoryModel.find({ 'user': { $in: userIds } });
    const historyToday = await HistoryTodayModel.find({ 'user': { $in: userIds } });
    const updatedUser = [];

    users.map(user => {
      const u = JSON.parse(JSON.stringify(user));
      const historyMerged = [];
      const historyTodayMerged = [];

      history.map(h => {
        if (h.user.equals(user._id)) {
          historyMerged.push(h);
        }
      });

      historyToday.map(history => {
        if (history.user.equals(user._id)) {
          historyTodayMerged.push(history);
        }
      });

      u.history = historyMerged;
      u.historyToday = historyTodayMerged;
      return updatedUser.push(u);
    })

    return updatedUser;
  } catch (error) {
    return error;
  }
}

export async function getUser(userId) {
  if (!userId) {
    return errorMessages.generals.missingId;
  }

  try {
    const user = await UsersModel.findById(userId);

    if (!user) {
      return errorMessages.users.notFound;
    }

    return user;
  } catch (error) {
    return error;
  }
}

export async function postUser(user) {
  const newUser = createNewEntity(user, UsersModel);

  const token = crypto.createHash('md5').update(Math.random().toString().substring(2)).digest('hex');
  newUser.token = token;

  try {
    const savedUser = await newUser.save();

    sendMail('Confirmez votre e-mail',
      {
        email: savedUser.email,
        username: savedUser.username,
        token: token,
      });

    return savedUser;
  } catch (error) {
    throw error;
  }
}

export async function updatePassword(userId, { password, newPassword }) {
  if (!userId) {
    return errorMessages.generals.missingId;
  }

  try {
    const user = await UsersModel.findById(userId);

    if (!user) {
      return errorMessages.users.notFound;
    }

    const isValidPass = await comparePassword(password, user.password);

    if (!isValidPass) {
      return {
        error: 'wrongPassword', messages: 'Mot de passe incorrect'
      };
    }

    user.password = newPassword;

    return user.save();
  } catch (error) {
    throw error;
  }
}

export async function patchUser(userId, updatesAttributes) {
  if (!userId) {
    return errorMessages.generals.missingId;
  }

  try {
    const user = await UsersModel.findById(userId);

    if (!user) {
      return errorMessages.users.notFound;
    }

    const updatedUser = mergeEntity(updatesAttributes, UsersModel);

    for (const key in updatedUser) {
      user[key] = updatedUser[key];
    }

    return await user.save();
  } catch (error) {
    throw error;
  }
}

export async function deleteUser(userId) {
  if (!userId) {
    return errorMessages.generals.missingId;
  }

  try {
    const user = await UsersModel.findOneAndDelete({
      _id: userId,
    });

    if (!user) {
      return errorMessages.users.notFound;
    }

    return user;
  } catch (error) {
    return error;
  }
}

export async function login(email, password) {
  if (!email || !password) {
    return errorMessages.users.noEmailPassword;
  }

  try {
    const user = await UsersModel.findOne({
      email,
    }).select('+password').select('+confirmed');

    if (!user) {
      return { error: 'Utilisateur non trouvé'};
    }

    if (!user.confirmed) {
      return { error: 'L\'utilisateur n\'a pas validé sont compte' };
    }

    const isValidPass = await comparePassword(password, user.password);
    if (!isValidPass) {
      return {
        error: 'Mot de passe incorect'
      };
    }

    return user;
  } catch (error) {
    return error;
  }
}

export async function confirm(token) {
  const user = await UsersModel.findOne({ token }).select('+token');

  if (!user) {
    return { messages: errorMessages.users.notFound, error: true };
  }

  // 1 day expiration date
  const expiresIn = 1000 * 60 * 60 * 24;

  if ((Date.now() - user.expires) > expiresIn) {
    await user.remove();
    return res.json('Le lien de validation a expiré ! Le compte a été supprimé !');
  }

  user.confirmed = true;
  await user.save();

  return user;
}
