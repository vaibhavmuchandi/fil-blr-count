"use client"
import { useEffect, useState } from "react";

export default function Home() {
  const [hasCalled, setHasCalled] = useState<Boolean>(false)
  const [registrations, setRegistrations] = useState(0)
  const [approved, setApproved] = useState(0)
  const options: RequestInit = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'x-luma-api-key': String(process.env.LUMA_KEY)
    }
  };
  const getMore = async (cursor: string) => {
    const response = await fetch(`https://api.lu.ma/public/v1/event/get-guests?event_api_id=evt-LMsbYmUh8x4MKwk&pagination_cursor=${cursor}`, options);
    const json = await response.json();

    // Using a functional update to ensure the latest state is used
    setRegistrations(prevRegistrations => prevRegistrations + json.entries.length);
    json.entries.forEach((resp: any) => {
      if (resp.guest.approval_status == "approved") {
        setApproved(prevApproved => prevApproved + 1)
      }
    })
    if (json.has_more) {
      getMore(json.next_cursor);
    }
  };

  const getStats = async () => {
    setHasCalled(true);
    fetch('https://api.lu.ma/public/v1/event/get-guests?event_api_id=evt-LMsbYmUh8x4MKwk', options)
      .then(response => response.json())
      .then(response => {
        if (response.has_more) {
          getMore(response.next_cursor);
          setRegistrations(prevRegistrations => prevRegistrations + response.entries.length);
          response.entries.forEach((resp: any) => {
            if (resp.guest.approval_status == "approved") {
              setApproved(prevApproved => prevApproved + 1)
            }
          })
        }
      })
      .catch(err => console.error(err));
  };


  useEffect(() => {
    if (!hasCalled) {
      getStats()
    }
  }, [])
  return (
    <div className="bg-gray-900 h-screen w-screen flex items-center justify-center">
      <div className="text-white p-8 rounded-lg shadow-lg bg-gray-800 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <div className=" text-white py-1 px-3 rounded-full text-sm">
            <img src={"/logo.png"} alt={'logo'} className='w-full h-full' />
          </div>
        </div>
        <div className="mb-4 flex items-center justify-center flex-col">
          <h2 className="text-2xl font-bold mb-3">Registrations</h2>
          <div className="flex space-x-2">
            {String(Math.floor(registrations)).split('').map((digit, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded text-4xl font-bold text-center">
                {digit}
              </div>
            ))}
          </div>
        </div>
        <div className='text-center'>
          <h3 className="text-xl font-semibold">Approved: <span id="approvedCount">{approved}</span></h3>
        </div>
      </div>
    </div>
  )
}
