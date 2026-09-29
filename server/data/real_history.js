// Expanded Authentic Major Historical Disasters in India (2004 - 2024)
const MAJOR_DISASTERS = [
  // ---------------- TAMIL NADU ----------------
  { states: ['Tamil Nadu'], districts: ['Nagapattinam', 'Chennai', 'Cuddalore', 'Kanyakumari'], event: { hazardType: 'tsunami', year: 2004, severity: 100, affectedPopulation: 250000, description: '2004 Indian Ocean Tsunami', source: 'official' } },
  { states: ['Tamil Nadu'], districts: ['Cuddalore', 'Villupuram', 'Nagapattinam'], event: { hazardType: 'cyclone', year: 2008, severity: 80, affectedPopulation: 100000, description: 'Cyclone Nisha', source: 'official' } },
  { states: ['Tamil Nadu'], districts: ['Cuddalore', 'Puducherry'], event: { hazardType: 'cyclone', year: 2011, severity: 85, affectedPopulation: 200000, description: 'Cyclone Thane', source: 'official' } },
  { states: ['Tamil Nadu'], districts: ['Chennai', 'Kanchipuram', 'Tiruvallur', 'Cuddalore'], event: { hazardType: 'flood', year: 2015, severity: 95, affectedPopulation: 1800000, description: '2015 Chennai Floods', source: 'official' } },
  { states: ['Tamil Nadu'], districts: ['Chennai', 'Tiruvallur', 'Kanchipuram'], event: { hazardType: 'cyclone', year: 2016, severity: 90, affectedPopulation: 500000, description: 'Cyclone Vardah', source: 'official' } },
  { states: ['Tamil Nadu', 'Kerala'], districts: ['Kanyakumari', 'Thiruvananthapuram'], event: { hazardType: 'cyclone', year: 2017, severity: 85, affectedPopulation: 150000, description: 'Cyclone Ockhi', source: 'official' } },
  { states: ['Tamil Nadu'], districts: ['Nagapattinam', 'Thanjavur', 'Pudukkottai', 'Tiruvarur'], event: { hazardType: 'cyclone', year: 2018, severity: 95, affectedPopulation: 350000, description: 'Cyclone Gaja', source: 'official' } },
  { states: ['Tamil Nadu'], districts: ['Cuddalore', 'Villupuram', 'Chennai'], event: { hazardType: 'cyclone', year: 2020, severity: 80, affectedPopulation: 250000, description: 'Cyclone Nivar', source: 'official' } },
  { states: ['Tamil Nadu'], districts: ['Chennai', 'Tiruvallur', 'Kanchipuram', 'Chengalpattu'], event: { hazardType: 'cyclone', year: 2023, severity: 85, affectedPopulation: 300000, description: 'Cyclone Michaung', source: 'official' } },
  { states: ['Tamil Nadu'], districts: ['Thoothukudi', 'Tirunelveli', 'Kanyakumari', 'Tenkasi'], event: { hazardType: 'flood', year: 2023, severity: 90, affectedPopulation: 200000, description: '2023 South Tamil Nadu Extreme Floods', source: 'official' } },

  // ---------------- ANDHRA PRADESH & TELANGANA ----------------
  { states: ['Andhra Pradesh'], districts: ['Prakasam', 'Guntur', 'Krishna'], event: { hazardType: 'cyclone', year: 2010, severity: 75, affectedPopulation: 100000, description: 'Cyclone Laila', source: 'official' } },
  { states: ['Andhra Pradesh'], districts: ['Visakhapatnam', 'Vizianagaram', 'Srikakulam'], event: { hazardType: 'cyclone', year: 2014, severity: 95, affectedPopulation: 600000, description: 'Very Severe Cyclone Hudhud', source: 'official' } },
  { states: ['Andhra Pradesh'], districts: ['Srikakulam', 'Vizianagaram'], event: { hazardType: 'cyclone', year: 2018, severity: 85, affectedPopulation: 300000, description: 'Cyclone Titli', source: 'official' } },
  { states: ['Andhra Pradesh'], districts: ['East Godavari', 'West Godavari'], event: { hazardType: 'cyclone', year: 2018, severity: 75, affectedPopulation: 100000, description: 'Cyclone Phethai', source: 'official' } },
  { states: ['Andhra Pradesh'], districts: ['Chittoor', 'Nellore', 'Kadapa', 'Anantapur'], event: { hazardType: 'flood', year: 2021, severity: 85, affectedPopulation: 150000, description: '2021 Rayalaseema Floods', source: 'official' } },
  { states: ['Telangana'], districts: ['Hyderabad', 'Ranga Reddy', 'Medchal'], event: { hazardType: 'flood', year: 2020, severity: 90, affectedPopulation: 400000, description: '2020 Hyderabad Floods', source: 'official' } },

  // ---------------- ODISHA ----------------
  { states: ['Odisha'], districts: ['Ganjam', 'Puri', 'Khordha'], event: { hazardType: 'cyclone', year: 2013, severity: 95, affectedPopulation: 1000000, description: 'Cyclone Phailin', source: 'official' } },
  { states: ['Odisha'], districts: ['Puri', 'Khordha', 'Cuttack', 'Jagatsinghpur', 'Kendrapara'], event: { hazardType: 'cyclone', year: 2019, severity: 100, affectedPopulation: 1500000, description: 'Extremely Severe Cyclone Fani', source: 'official' } },
  { states: ['Odisha', 'West Bengal'], districts: ['Balasore', 'Bhadrak', 'Kendrapara', 'East Midnapore'], event: { hazardType: 'cyclone', year: 2021, severity: 85, affectedPopulation: 800000, description: 'Cyclone Yaas', source: 'official' } },
  { states: ['Odisha'], districts: ['Gajapati', 'Rayagada'], event: { hazardType: 'landslide', year: 2018, severity: 80, affectedPopulation: 50000, description: 'Cyclone Titli Landslides', source: 'official' } },

  // ---------------- WEST BENGAL ----------------
  { states: ['West Bengal'], districts: ['South 24 Parganas', 'North 24 Parganas'], event: { hazardType: 'cyclone', year: 2009, severity: 85, affectedPopulation: 1000000, description: 'Cyclone Aila', source: 'official' } },
  { states: ['West Bengal'], districts: ['South 24 Parganas', 'North 24 Parganas', 'Kolkata', 'East Midnapore', 'Howrah'], event: { hazardType: 'cyclone', year: 2020, severity: 100, affectedPopulation: 3000000, description: 'Super Cyclone Amphan', source: 'official' } },
  { states: ['West Bengal'], districts: ['South 24 Parganas', 'East Midnapore'], event: { hazardType: 'cyclone', year: 2019, severity: 80, affectedPopulation: 500000, description: 'Cyclone Bulbul', source: 'official' } },
  { states: ['West Bengal'], districts: ['South 24 Parganas', 'North 24 Parganas', 'Kolkata'], event: { hazardType: 'cyclone', year: 2024, severity: 85, affectedPopulation: 800000, description: 'Cyclone Remal', source: 'official' } },

  // ---------------- KERALA ----------------
  { states: ['Kerala'], districts: ['Idukki', 'Ernakulam', 'Pathanamthitta', 'Alappuzha', 'Wayanad', 'Thrissur', 'Kottayam'], event: { hazardType: 'flood', year: 2018, severity: 100, affectedPopulation: 5400000, description: '2018 Kerala Floods', source: 'official' } },
  { states: ['Kerala'], districts: ['Malappuram', 'Wayanad', 'Kannur', 'Kozhikode'], event: { hazardType: 'landslide', year: 2019, severity: 95, affectedPopulation: 300000, description: '2019 Kerala Floods & Landslides (Kavalappara, Puthumala)', source: 'official' } },
  { states: ['Kerala'], districts: ['Idukki'], event: { hazardType: 'landslide', year: 2020, severity: 90, affectedPopulation: 1000, description: 'Pettimudi Landslide', source: 'official' } },
  { states: ['Kerala'], districts: ['Kottayam', 'Idukki'], event: { hazardType: 'cloudburst', year: 2021, severity: 85, affectedPopulation: 50000, description: '2021 Kerala Floods & Landslides (Koottickal)', source: 'official' } },
  { states: ['Kerala'], districts: ['Wayanad'], event: { hazardType: 'landslide', year: 2024, severity: 100, affectedPopulation: 15000, description: '2024 Wayanad Catastrophic Landslides (Mundakkai)', source: 'official' } },

  // ---------------- MAHARASHTRA & GUJARAT ----------------
  { states: ['Maharashtra'], districts: ['Mumbai', 'Mumbai Suburban', 'Thane', 'Raigad', 'Ratnagiri'], event: { hazardType: 'flood', year: 2005, severity: 100, affectedPopulation: 2500000, description: '2005 Mumbai Extreme Floods', source: 'official' } },
  { states: ['Maharashtra'], districts: ['Raigad', 'Ratnagiri'], event: { hazardType: 'cyclone', year: 2020, severity: 85, affectedPopulation: 100000, description: 'Cyclone Nisarga', source: 'official' } },
  { states: ['Maharashtra'], districts: ['Ratnagiri', 'Raigad', 'Satara', 'Kolhapur', 'Sangli'], event: { hazardType: 'flood', year: 2021, severity: 90, affectedPopulation: 400000, description: '2021 Maharashtra Floods & Landslides (Chiplun/Mahad)', source: 'official' } },
  { states: ['Maharashtra'], districts: ['Pune'], event: { hazardType: 'flood', year: 2024, severity: 80, affectedPopulation: 50000, description: '2024 Pune Floods', source: 'official' } },
  { states: ['Gujarat'], districts: ['Surat', 'Navsari'], event: { hazardType: 'flood', year: 2006, severity: 95, affectedPopulation: 1000000, description: '2006 Surat Floods', source: 'official' } },
  { states: ['Gujarat'], districts: ['Banaskantha', 'Patan'], event: { hazardType: 'flood', year: 2017, severity: 85, affectedPopulation: 400000, description: '2017 Gujarat Floods', source: 'official' } },
  { states: ['Gujarat'], districts: ['Gir Somnath', 'Amreli', 'Bhavnagar', 'Diu'], event: { hazardType: 'cyclone', year: 2021, severity: 90, affectedPopulation: 300000, description: 'Extremely Severe Cyclone Tauktae', source: 'official' } },
  { states: ['Gujarat'], districts: ['Kutch', 'Devbhoomi Dwarka', 'Jamnagar', 'Porbandar'], event: { hazardType: 'cyclone', year: 2023, severity: 85, affectedPopulation: 150000, description: 'Cyclone Biparjoy', source: 'official' } },
  { states: ['Gujarat'], districts: ['Vadodara', 'Bharuch', 'Narmada'], event: { hazardType: 'flood', year: 2024, severity: 85, affectedPopulation: 250000, description: '2024 Gujarat/Vadodara Floods', source: 'official' } },

  // ---------------- UTTARAKHAND & HIMACHAL PRADESH ----------------
  { states: ['Uttarakhand'], districts: ['Rudraprayag', 'Uttarkashi', 'Chamoli', 'Pithoragarh', 'Tehri Garhwal'], event: { hazardType: 'cloudburst', year: 2013, severity: 100, affectedPopulation: 500000, description: '2013 Kedarnath Flash Floods & Cloudburst', source: 'official' } },
  { states: ['Uttarakhand'], districts: ['Chamoli'], event: { hazardType: 'flood', year: 2021, severity: 90, affectedPopulation: 10000, description: '2021 Chamoli Disaster (GLOF/Avalanche)', source: 'official' } },
  { states: ['Uttarakhand'], districts: ['Pithoragarh', 'Almora'], event: { hazardType: 'landslide', year: 2020, severity: 80, affectedPopulation: 20000, description: '2020 Pithoragarh Cloudbursts', source: 'official' } },
  { states: ['Himachal Pradesh'], districts: ['Kullu', 'Mandi', 'Shimla', 'Solan', 'Kinnaur'], event: { hazardType: 'flood', year: 2023, severity: 95, affectedPopulation: 400000, description: '2023 Himachal Pradesh Mega Floods & Landslides', source: 'official' } },
  { states: ['Himachal Pradesh'], districts: ['Kinnaur', 'Lahaul and Spiti'], event: { hazardType: 'landslide', year: 2021, severity: 85, affectedPopulation: 5000, description: '2021 Kinnaur Landslides', source: 'official' } },

  // ---------------- BIHAR, UP, & NORTH INDIA ----------------
  { states: ['Bihar'], districts: ['Supaul', 'Araria', 'Saharsa', 'Madhepura', 'Purnia'], event: { hazardType: 'flood', year: 2008, severity: 100, affectedPopulation: 3300000, description: '2008 Kosi River Catastrophic Floods', source: 'official' } },
  { states: ['Bihar'], districts: ['Patna', 'Bhagalpur', 'Gaya', 'Muzaffarpur', 'Darbhanga', 'Samastipur'], event: { hazardType: 'flood', year: 2019, severity: 90, affectedPopulation: 2000000, description: '2019 Bihar Floods (Patna Waterlogging)', source: 'official' } },
  { states: ['Bihar', 'Uttar Pradesh'], districts: ['Sitamarhi', 'Madhubani', 'East Champaran', 'Kushinagar', 'Gorakhpur'], event: { hazardType: 'flood', year: 2017, severity: 85, affectedPopulation: 1500000, description: '2017 North India Floods', source: 'official' } },
  { states: ['Uttar Pradesh'], districts: ['Varanasi', 'Allahabad', 'Ghazipur', 'Ballia'], event: { hazardType: 'flood', year: 2016, severity: 80, affectedPopulation: 800000, description: '2016 Ganga Basin Floods', source: 'official' } },
  { states: ['Delhi', 'Uttar Pradesh', 'Haryana'], districts: ['North Delhi', 'East Delhi', 'Gautam Buddha Nagar', 'Faridabad'], event: { hazardType: 'flood', year: 2023, severity: 85, affectedPopulation: 500000, description: '2023 Yamuna Floods', source: 'official' } },

  // ---------------- ASSAM & NORTH EAST ----------------
  { states: ['Assam'], districts: ['Dhemaji', 'Lakhimpur', 'Barpeta', 'Nalbari', 'Kamrup', 'Morigaon'], event: { hazardType: 'flood', year: 2004, severity: 95, affectedPopulation: 2500000, description: '2004 Assam Floods', source: 'official' } },
  { states: ['Assam'], districts: ['Majuli', 'Jorhat', 'Dibrugarh', 'Tinsukia'], event: { hazardType: 'flood', year: 2012, severity: 90, affectedPopulation: 2000000, description: '2012 Brahmaputra Floods', source: 'official' } },
  { states: ['Assam'], districts: ['Cachar', 'Nagaon', 'Karimganj', 'Hailakandi', 'Dima Hasao'], event: { hazardType: 'flood', year: 2022, severity: 95, affectedPopulation: 1500000, description: '2022 Silchar/Barak Valley Extreme Floods', source: 'official' } },
  { states: ['Assam'], districts: ['Dhubri', 'Goalpara', 'Bongaigaon', 'South Salmara'], event: { hazardType: 'flood', year: 2020, severity: 85, affectedPopulation: 2800000, description: '2020 Assam Floods', source: 'official' } },
  { states: ['Sikkim'], districts: ['Mangan', 'Gangtok', 'Pakyong', 'Namchi'], event: { hazardType: 'earthquake', year: 2011, severity: 95, affectedPopulation: 100000, description: '2011 Sikkim Earthquake (6.9 Mw)', source: 'official' } },
  { states: ['Sikkim'], districts: ['Mangan', 'Gangtok', 'Pakyong'], event: { hazardType: 'flood', year: 2023, severity: 95, affectedPopulation: 80000, description: '2023 South Lhonak Lake GLOF (Teesta Flash Floods)', source: 'official' } },
  { states: ['Manipur'], districts: ['Tamenglong', 'Noney', 'Imphal West', 'Imphal East'], event: { hazardType: 'earthquake', year: 2016, severity: 85, affectedPopulation: 150000, description: '2016 Manipur Earthquake (6.7 Mw)', source: 'official' } },
  { states: ['Manipur'], districts: ['Noney'], event: { hazardType: 'landslide', year: 2022, severity: 90, affectedPopulation: 5000, description: '2022 Tupul Railway Station Landslide', source: 'official' } },

  // ---------------- JAMMU & KASHMIR, LADAKH ----------------
  { states: ['Jammu & Kashmir'], districts: ['Baramulla', 'Kupwara', 'Poonch', 'Srinagar'], event: { hazardType: 'earthquake', year: 2005, severity: 100, affectedPopulation: 1500000, description: '2005 Kashmir Earthquake (7.6 Mw)', source: 'official' } },
  { states: ['Ladakh'], districts: ['Leh'], event: { hazardType: 'cloudburst', year: 2010, severity: 90, affectedPopulation: 25000, description: '2010 Leh Cloudburst & Mudslides', source: 'official' } },
  { states: ['Jammu & Kashmir'], districts: ['Srinagar', 'Anantnag', 'Rajouri', 'Bandipora', 'Pulwama', 'Kulgam'], event: { hazardType: 'flood', year: 2014, severity: 95, affectedPopulation: 2000000, description: '2014 Kashmir Valley Catastrophic Floods', source: 'official' } },
  { states: ['Jammu & Kashmir'], districts: ['Ganderbal', 'Anantnag'], event: { hazardType: 'cloudburst', year: 2021, severity: 80, affectedPopulation: 10000, description: '2021 Amarnath/Kishtwar Cloudbursts', source: 'official' } },

  // ---------------- KARNATAKA ----------------
  { states: ['Karnataka'], districts: ['Raichur', 'Koppal', 'Ballari', 'Vijayapura', 'Bagalkot'], event: { hazardType: 'flood', year: 2009, severity: 90, affectedPopulation: 2000000, description: '2009 North Karnataka Floods', source: 'official' } },
  { states: ['Karnataka'], districts: ['Kodagu', 'Dakshina Kannada', 'Hassan'], event: { hazardType: 'landslide', year: 2018, severity: 90, affectedPopulation: 100000, description: '2018 Kodagu Floods & Landslides', source: 'official' } },
  { states: ['Karnataka'], districts: ['Belagavi', 'Dharwad', 'Uttara Kannada', 'Udupi'], event: { hazardType: 'flood', year: 2019, severity: 85, affectedPopulation: 500000, description: '2019 Karnataka Floods', source: 'official' } },
  { states: ['Karnataka'], districts: ['Bengaluru Urban', 'Bengaluru Rural'], event: { hazardType: 'flood', year: 2022, severity: 80, affectedPopulation: 300000, description: '2022 Bengaluru Floods', source: 'official' } },

  // ---------------- OTHERS (MP, RAJASTHAN, GOA) ----------------
  { states: ['Madhya Pradesh'], districts: ['Hoshangabad', 'Bhopal', 'Vidisha', 'Sehore'], event: { hazardType: 'flood', year: 2020, severity: 85, affectedPopulation: 800000, description: '2020 Narmada Basin Floods', source: 'official' } },
  { states: ['Madhya Pradesh'], districts: ['Rewa', 'Satna', 'Panna'], event: { hazardType: 'flood', year: 2016, severity: 80, affectedPopulation: 500000, description: '2016 Vindhya Region Floods', source: 'official' } },
  { states: ['Rajasthan'], districts: ['Barmer', 'Jalore', 'Pali'], event: { hazardType: 'flood', year: 2017, severity: 80, affectedPopulation: 300000, description: '2017 Rajasthan Floods', source: 'official' } },
  { states: ['Goa'], districts: ['North Goa', 'South Goa'], event: { hazardType: 'flood', year: 2021, severity: 85, affectedPopulation: 50000, description: '2021 Goa Floods (Cyclone Tauktae impact)', source: 'official' } }
];

function getRealHistory(state, district) {
  const history = [];
  const s = (state || '').toLowerCase();
  const d = (district || '').toLowerCase();
  
  for (const disaster of MAJOR_DISASTERS) {
    const matchState = disaster.states.some(st => st.toLowerCase() === s);
    const matchDist = disaster.districts.some(dt => dt.toLowerCase() === d);
    
    if (matchDist) {
      history.push({ ...disaster.event });
    }
  }
  return history;
}

module.exports = { getRealHistory, MAJOR_DISASTERS };
