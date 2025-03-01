const Hero = require('./../models/heroModel');

exports.createHero = async (req, res) => {
    try {
        //create a hero
        const newHero = await Hero.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                newHero,
            },
        });
    } catch (error) {
        res.status(500).json({
            status: 'Fail',
            message: 'Error creating a Hero Section!',
        });
    }
};

exports.getHero = async (req, res) => {
    try {
        //fetchs hero
        const hero = await Hero.findById(req.params.id);

        if (!hero) {
            return res.status(404).json({
                status: 'Fail',
                message: 'Hero section Not Found!',
            });
        }
        res.status(200).json({
            status: 'success',
            data: {
                hero,
            },
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching hero',
        });
    }
};

exports.updateHero = async (req, res) => {
    try {
        //  Update hero with validation
        const updatedHero = await Hero.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } 
        );

        if (!updatedHero) {
            return res.status(404).json({
                status: 'fail',
                message: 'Hero section not found!',
            });
        }

        res.status(200).json({
            //  Fixed "satus" typo
            status: 'success',
            data: {
                hero: updatedHero, // Renamed for clarity
            },
        });
    } catch (err) {
        console.error(' Error updating hero:', err); 
        res.status(500).json({
            status: 'fail',
            message: 'Error updating hero',
        });
    }
};
