import { useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import AppNavbar from '../../components/Navbar';


const Select = dynamic(() => import('react-select'), { ssr: false });

const cityOptions = [
  { value: 'split', label: 'Split, Croatia' },
  { value: 'zagreb', label: 'Zagreb, Croatia' },
  { value: 'dubrovnik', label: 'Dubrovnik, Croatia' },
  { value: 'berlin', label: 'Berlin, Germany' },
  { value: 'paris', label: 'Paris, France' },
  { value: 'london', label: 'London, United Kingdom' },
];

const CreateTrip = () => {
  const router = useRouter();
  const [tripDetails, setTripDetails] = useState({
    name: '',
    startDate: '',
    endDate: '',
    currLocation: '',
    departure: '',
    destination: '',
    transportType: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTripDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleCityChange = (selectedOption: any, actionMeta: { name: string }) => {
    const { name } = actionMeta;
    setTripDetails((prev) => ({ ...prev, [name]: selectedOption?.value || '' }));
  };

  const handleNext = () => {
    localStorage.setItem('tripDetails', JSON.stringify(tripDetails));
    if (tripDetails.transportType === 'road') {
      router.push('/trips/new/transport');
    } else if (tripDetails.transportType === 'air') {
      router.push('/trips/new/flights');
    }
  };

  const isFormValid = () => {
    const { name, startDate, endDate, departure, destination, transportType, currLocation } = tripDetails;
    if (!name || !startDate || !endDate || !departure || !destination || !transportType) return false;
    if (transportType === 'air' && !currLocation) return false;
    return true;
  };

  return (
    <>
      <AppNavbar />
      <div className="max-w-3xl mx-auto mt-10 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Create New Trip</h1>
        <div className="space-y-6 bg-white shadow-xl rounded-2xl p-8 border border-gray-200">

  {/* Trip Name */}
  <div>
    <label className="block text-sm font-semibold text-gray-600 mb-1">Trip Name</label>
    <input
      type="text"
      name="name"
      value={tripDetails.name}
      onChange={handleChange}
      placeholder="e.g. Summer in Croatia"
      className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
    />
  </div>

  {/* Dates */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label className="block text-sm font-semibold text-gray-600 mb-1">Start Date</label>
      <input
        type="date"
        name="startDate"
        value={tripDetails.startDate}
        onChange={handleChange}
        className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
      />
    </div>
    <div>
      <label className="block text-sm font-semibold text-gray-600 mb-1">End Date</label>
      <input
        type="date"
        name="endDate"
        min={tripDetails.startDate}
        value={tripDetails.endDate}
        onChange={handleChange}
        className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
      />
    </div>
  </div>

  {/* Departure */}
  <div>
    <label className="block text-sm font-semibold text-gray-600 mb-1">Departure Location</label>
    <Select
      name="departure"
      options={cityOptions}
      onChange={handleCityChange}
      placeholder="Choose city of departure"
      classNamePrefix="react-select"
    />
  </div>

  {/* Destination */}
  <div>
    <label className="block text-sm font-semibold text-gray-600 mb-1">Destination</label>
    <Select
      name="destination"
      options={cityOptions}
      onChange={handleCityChange}
      placeholder="Choose your destination"
      classNamePrefix="react-select"
    />
  </div>

  {/* Transport Type */}
  <div>
    <label className="block text-sm font-semibold text-gray-600 mb-1">Transport Type</label>
    <select
      name="transportType"
      value={tripDetails.transportType}
      onChange={handleChange}
      className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
    >
      <option value="">Choose transport type</option>
      <option value="road">Road (Bus, Train, Rent-a-Car)</option>
      <option value="air">Air (Flight)</option>
    </select>
  </div>

  {/* Current Location (only if air) */}
  <div>
    <label className="block text-sm font-semibold text-gray-600 mb-1">Current Location</label>
    <Select
      name="currLocation"
      options={cityOptions}
      onChange={handleCityChange}
      placeholder="Where are you now?"
      isDisabled={tripDetails.transportType !== 'air'}
      classNamePrefix="react-select"
    />
  </div>

  {/* Submit Button */}
  <button
    onClick={handleNext}
    disabled={!isFormValid()}
    className={`w-full py-3 text-lg rounded-xl font-semibold text-white transition-shadow ${
      isFormValid()
        ? 'bg-yellow-500 hover:bg-yellow-600 shadow-lg hover:shadow-xl'
        : 'bg-gray-300 cursor-not-allowed'
    }`}
  >
    Next
  </button>

</div>

      </div>
    </>
  );
};

export default CreateTrip;
