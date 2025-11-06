const express = require('express');
const app = express();
const path = require('path'); // Helps with file paths
const sqlData = require('../database/myRepository');
const { log } = require('console');
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

const homeScreen = async (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
};


const homePage = async (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'welcome.html'));
};

const dataPage = async (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'data.html'));
};

const data = async (req, res) => {    
    const {switch_id, startTime, endTime} = req.body;
    console.log('Received request:', { switch_id, startTime, endTime });
    
    try {
        const getSqlData = await sqlData.getActiveEnergy(switch_id, startTime, endTime);
        console.log('SQL Data:', getSqlData);
        
        res.status(200).json(getSqlData); 
    } catch(err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }  
};

const breakersMainData = async (req, res) => {

    try{
        const getBreakerDataFromSql = await sqlData.getBreakersMainData();
        res.status(200).json(getBreakerDataFromSql);
    }catch(err){

    }
};

module.exports = {homeScreen, homePage, dataPage, data, breakersMainData};
