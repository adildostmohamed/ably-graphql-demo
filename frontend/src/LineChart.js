import React, { useState, useEffect } from "react";
import { useQuery, useSubscription } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { Line } from "react-chartjs-2";

const GET_PRICES = gql`
  {
    messages(limit: 200) {
      id
      price
      exec_date
    }
  }
`;

const MESSAGES_SUBSCRIPTION = gql`
  subscription Message {
    message {
      id
      price
      exec_date
    }
  }
`;

const LineChart = () => {
  const [prices, setPrices] = useState([]);
  const [times, setTimes] = useState([]);
  const { loading, error, data } = useQuery(GET_PRICES);
  const {
    data: subscriptionData,
    loading: subscriptionLoading
  } = useSubscription(MESSAGES_SUBSCRIPTION, {
    onSubscriptionData: ({ subscriptionData }) => {
      console.log(subscriptionData);
      const newPriceData = subscriptionData.data.message.price;
      const newPriceTime = new Date(
        subscriptionData.data.message.exec_date
      ).toLocaleTimeString("en-GB");
      setPrices([...prices, newPriceData]);
      setTimes([...times, newPriceTime]);
    }
  });
  useEffect(() => {
    if (data && data.messages) {
      const prices = data.messages.map(message => message.price);
      const times = data.messages.map(message =>
        new Date(message.exec_date).toLocaleTimeString("en-GB")
      );
      setPrices(prices);
      setTimes(times);
    }
  }, [data, subscriptionData]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :( {`${error}`}</p>;

  const chartingData = {
    labels: [...times],
    datasets: [
      {
        label: "Bitcoin Prices in USD",
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "rgba(75,192,192,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: [...prices]
      }
    ]
  };
  return (
    <div style={{ margin: "0 auto", width: "1200px", height: "800px" }}>
      <Line data={chartingData} />
      <pre>{JSON.stringify(subscriptionData)}</pre>
      <pre>{JSON.stringify(subscriptionLoading)}</pre>
    </div>
  );
};

export default LineChart;
