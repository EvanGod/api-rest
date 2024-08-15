import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Role from '../models/Role.js';

export const verifyToken = async (req, res, next) => {
    try {
      const token = req.headers['x-access-token'];
      if (!token) return res.status(403).json({ message: "No se ha proporcionado ningún Token" });
  
      
      const decoded = jwt.verify(token, process.env.SECRET);
      req.userId = decoded.id;
  
      
      const user = await User.findById(req.userId, { password: 0 });
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
  
      
      next();
    } catch (error) {
      console.error(error);
      res.status(501).json({ message: "Token no válido" });
    }
  };


export const isModerator = async (req, res, next) => {
  const user = await User.findById(req.userId);
  const roles = await Role.find({ _id: {$in: user.roles}});
  for (let i=0; i < roles.length; i++){
      if(roles[i].name == "moderator"){
        next();
        return;
      }
  }

  return res.status(403).json({ message: "Requiere ser moderador "});
}

export const isAdmin = async (req, res, next) => {
  const user = await User.findById(req.userId);
  const roles = await Role.find({ _id: {$in: user.roles}});
  for (let i=0; i < roles.length; i++){
      if(roles[i].name == "admin"){
        next();
        return;
      }
  }

  return res.status(403).json({ message: "Requiere ser administrador "});
}

export const isAdminOrModerator = async (req, res, next) => {
  const user = await User.findById(req.userId);
  const roles = await Role.find({ _id: {$in: user.roles}});
  for (let i=0; i < roles.length; i++){
      if(roles[i].name == "moderator" || roles[i].name == "admin"){
        next();
        return;
      }
  }

  return res.status(403).json({ message: "Requiere ser moderador o administrador "});
}

