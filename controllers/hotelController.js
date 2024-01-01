const { v4: uuidv4 } = require("uuid");
const {
  Hotel,
  Room,
  Facility,
  RatingAndReview,
  Reservation,
  Sequelize,
} = require("../models");
const { logging } = require("googleapis/build/src/apis/logging");
const Op = Sequelize.Op;

const hotelController = {
  createHotel: async (req, res) => {
    try {
      const id = uuidv4();
      const {
        name,
        address,
        city,
        state,
        description,
        hotel_type,
        number_of_rooms,
        contact_email,
        contact_phone,
        terms_and_condition,
      } = req.body;
      const createHotel = await Hotel.create({
        id,
        name,
        address,
        city,
        state,
        description,
        hotel_type,
        number_of_rooms,
        contact_email,
        contact_phone,
        terms_and_condition,
      });
      // console.log('Record created', createHotel);
      return res
        .status(201)
        .send({ message: "Record created.", data: createHotel });
    } catch (err) {
      return res.status(500).send({ message: "An error occoured", err });
    }
  },

  findAllHotel: async (req, res) => {
    try {
      // SHowing likes, review, (avg)price/night, facilities
      // const capitalizeEveryFirstWord = (str) => {
        // return str.charAt(0).toUpperCase() + str.slice(1);
        // return str.replace(/\b\w/g, (char) => char.toUpperCase());
      // }
      const hotel_type = req.query.hotel_type;
      const search = req.query.search;
      const minPrice = req.query.minPrice || 0;
      const maxPrice = req.query.maxPrice;
      let nameCitySearch = [];
      if (search) {
        nameCitySearch.push({
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { city: { [Op.like]: `%${search}%` } },
            { state: { [Op.like]: `%${search}%` } },
          ],
        });
      }
      console.log("minPrice:", minPrice);
      console.log("maxPrice:", maxPrice);

      const whereConditions = {
        [Op.and]:[
          ...nameCitySearch,
        // Conditionally include price range
        // Sequelize.literal(`price BETWEEN '${minPrice}' AND '${maxPrice}'`),
        
        ]
      };
      if (minPrice !== undefined && maxPrice !== undefined) {
        whereConditions['$rooms.price$'] = {
          [Op.between]: [minPrice, maxPrice],
        };
      }
      if (hotel_type !== undefined){
        whereConditions['$hotel.hotel_type$'] = {
          [Op.like]: [hotel_type],
        }
      }
      const { count, rows: hotels } = await Hotel.findAndCountAll({
        // logging: console.log,
        distinct: true,
        attributes: {
          exclude: ["createdAt", "updatedAt", "deletedAt"],
        },
        where: whereConditions,
        include: [
          {
            model: Room,
            as: "rooms",
            attributes: {
              exclude: [
                "id",
                "hotel_id",
                "createdAt",
                "updatedAt",
                "deletedAt",
              ],
            },
          },
          {
            model: Facility,
            as: "facilities",
            attributes: {
              exclude: ["createdAt", "updatedAt", "deletedAt"],
            },
          },
          {
            model: RatingAndReview,
            as: "ratingAndReview",
            attributes: {
              exclude: ["createdAt", "updatedAt", "deletedAt"],
            },
          },
          {
            model: Reservation,
            as: "reservation",
            attributes: {
              exclude: ["createdAt", "updatedAt", "deletedAt"],
            },
          },
        ],
      });

      if(count == 0){
        return res.status(404).send({Message: 'No record found for this query, try using city name or hotel name and correct price range'})
      }
      return res
        .status(200)
        .send({ Message: `Hotel records found.`, Count: count, Hotel: hotels });
    } catch (err) {
      console.error(err);
      return res.status(500).send({ Message: "An error occoured", Error: err });
    }
  },

  findOneHotel: async (req, res) => {
    try {
      const id = req.params.id;
      const hotel = await Hotel.findOne({
        where: { id },
        attributes: {
          exclude: ["createdAt", "updatedAt", "deletedAt"],
        },
        include: [
          {
            model: Room,
            as: "rooms",
            attributes: {
              exclude: [
                "id",
                "hotel_id",
                "createdAt",
                "updatedAt",
                "deletedAt",
              ],
            },
          },
          {
            model: Facility,
            as: "facilities",
            attributes: {
              exclude: ["createdAt", "updatedAt", "deletedAt"],
            },
          },
          {
            model: RatingAndReview,
            as: "ratingAndReview",
            attributes: {
              exclude: ["createdAt", "updatedAt", "deletedAt"],
            },
          },
          {
            model: Reservation,
            as: "reservation",
            attributes: {
              exclude: ["createdAt", "updatedAt", "deletedAt"],
            },
          },
        ],
      });

      if (hotel) {
        return res
          .status(200)
          .send({ Message: "Hotel record found.", Hotel: hotel });
      } else {
        return res.status(404).send({ Message: "Hotel not found." });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send({ message: "An error occurred", err });
    }
  },

  updateHotel: async (req, res) => {
    try {
      const id = req.params.id;
      const {
        name,
        address,
        city,
        state,
        description,
        hotel_type,
        number_of_rooms,
        contact_email,
        contact_phone,
        terms_and_condition,
      } = req.body;
      const updateUser = await Hotel.update(
        {
          name,
          address,
          city,
          state,
          description,
          hotel_type,
          number_of_rooms,
          contact_email,
          contact_phone,
          terms_and_condition,
        },
        { where: { id } }
      );
      console.log("Record updated", createHotel);
      if (updateUser == 1) {
        return res
          .status(201)
          .send({ message: "Record created.", Hotel: createHotel });
      } else {
      }
    } catch (err) {
      return res.status(500).send({ message: "An error occoured", err });
    }
  },

  deleteHotel: async (req, res) => {
    try {
      const id = req.params.id;
      const hotel = await Hotel.destroy({ where: { id } });
      if (hotel == 1) {
        return res.send({
          message: `User with id ${id} has been deleted successfully!`,
        });
      }
      if (hotel == 0) {
        return res.send({
          message: `User ${id} does not exist or is deleted in the database`,
        });
      }
    } catch (err) {
      return res.status(500).send({ message: "An error occoured", err });
    }
  },
};
module.exports = hotelController;
