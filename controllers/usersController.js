// const { UUID, UUIDV4 } = require('sequelize');
const { v4: uuidv4 } = require("uuid");
const { User } = require('../models');
const user = require("../models/user");

exports.createUser = async (req, res) => {
  try{
    const { first_name, last_name, phone_number, email, address, type } = req.body;
    const id = uuidv4();
    
    // console.log(id, first_name, last_name, phone_number, email, type);
    const user_record = await User.create({ id, first_name, last_name, phone_number, email, address, type });
    console.log("User created", user_record);
    return res.status(201).send({ message: `User record for ${first_name} has been created successfully`, user_record })

  }catch(err) {
    console.log(err)
    return res.status(500).send({message: "An error occoured!", err});
  }
}

exports.findAllUser = async (req, res) => {
  try{
    const users = await User.findAndCountAll();
    // console.log('Records found', users)
    return res.status(200).send({message: 'Reccords found', users})
  }catch(err){
    console.log('An error occoured!', err);
    return res.send({message: 'Error showed up', err})
  };
};

exports.findOne =  async (req, res) => {
  try{
    const id = req.params.id;
    const user = await User.findOne({where: {id}});
    console.log('User found', user);
    return res.status(200).send({message: 'User found', user });
  }catch(err){
    console.log('Error occoured', err)
    res.status(500).send({message: 'Error happened', err});
  };
};

exports.deleteUser = async (req, res ) => {
  try{
    const id = req.params.id;
    const user = await User.destroy({where: {id}})
    console.log(user)
    if (user == 1 ){
      return res.send({message: `User with id ${id} has been deleted successfully!`})
    }
    if(user == 0){
      return res.send({message: `User ${id} does not exist or is deleted in the database`})
    }
  }catch(err){
    return res.status(500).send({message: 'Error occoured', err})
  }
};

exports.updateUser = async (req, res) => {
  try{
    const id = req.params.id;
    const {first_name, last_name, address, email, phone_number, type } = req.body;
    const updateUser = await User.update({first_name, last_name, address, email, phone_number, type }, {where: {id}});
    console.log(updateUser);
    if(updateUser == 1) {
      return res.status(200).send({ message: 'Record Updated' });
    }
    
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: 'Error occoured', err})
  }
};