// mastercard 
"use client"
import React from 'react';
import styled from 'styled-components';

const Card = () => {
  return (
    <StyledWrapper>
      <div className="card-container">
        <div className="card-box">
          <div className="card-head">
            <div className="card-chip">
              <svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.813 2C2.647 2 0 4.648 0 7.813v10.375C0 21.352 2.648 24 5.813 24h14.375C23.352 24 26 21.352 26 18.187V7.813C26 4.649 23.352 2 20.187 2H5.813zm0 2h14.375C22.223 4 24 5.777 24 7.813V9h-6c-.555 0-1-.445-1-1c0-.555.445-1 1-1a1 1 0 1 0 0-2c-1.645 0-3 1.355-3 3c0 1.292.844 2.394 2 2.813v4.968c-1.198.814-2 2.18-2 3.719c0 .923.293 1.781.781 2.5H10.22a4.439 4.439 0 0 0 .78-2.5c0-1.538-.802-2.905-2-3.719v-4.969c1.156-.418 2-1.52 2-2.812c0-1.645-1.355-3-3-3H6a1 1 0 0 0-.094 0a1.001 1.001 0 0 0-.093 0A1.004 1.004 0 0 0 6 7h2c.555 0 1 .445 1 1c0 .555-.445 1-1 1H2V7.812C2 5.777 3.777 4 5.813 4zM2 11h5v4H2v-4zm17 0h5v4h-5v-4zM2 17h4.5C7.839 17 9 18.161 9 19.5S7.839 22 6.5 22h-.688C3.777 22 2 20.223 2 18.187V17zm17.5 0H24v1.188C24 20.223 22.223 22 20.187 22H19.5c-1.339 0-2.5-1.161-2.5-2.5s1.161-2.5 2.5-2.5z" fill="currentcolor" />
              </svg>
            </div>
            <div className="card-logo">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g fillRule="evenodd" fill="none">
                  <circle r={7} fill="#ea001b" cy={12} cx={7} />
                  <circle r={7} fillOpacity=".8" fill="#ffa200" cy={12} cx={17} />
                </g>
              </svg>
            </div>
          </div>
          <div className="card-number-row">
            <span>6037 1234 4567 8910</span>
          </div>
          <div className="card-details">
            <div className="card-holder-col">
              <span className="card-holder-title">CARD HOLDER</span>
              <span className="card-holder-name">ALI ABDI</span>
            </div>
            <div className="card-date-col">
              <span className="card-date-title">VALID THRU</span>
              <span className="card-date-sub">06/26</span>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card-container,
  .card-box,
  .card-head,
  .card-number-row,
  .card-details,
  .card-holder-col,
  .card-date-col {
    display: flex;
  }
  .card-container {
    align-items: center;
    justify-content: center;
  }
  .card-box {
    width: 340px;
    min-height: 160px;
    background: #fff;
    box-shadow: 0px 0px 15px -2px rgba(0, 0, 0, 0.1);
    border-radius: 18px;
    margin: 16px;
    padding: 1.5em;
    flex-direction: column;
    justify-content: space-around;
    gap: 1.2em;
  }
  .card-head {
    justify-content: space-between;
    align-items: center;
  }
  .card-chip svg {
    width: 32px;
    height: 32px;
  }
  .card-chip svg path {
    fill: #636363;
  }
  .card-logo svg {
    width: 48px;
    height: 48px;
  }
  .card-number-row {
    justify-content: center;
    word-spacing: 1em;
    font-size: 1.3em;
    font-weight: 600;
  }
  .card-box:hover .card-number-row {
    font-size: 1.32em;
  }
  .card-details {
    justify-content: space-between;
    text-transform: uppercase;
  }
  .card-holder-col {
    flex-direction: column;
    gap: 2px;
  }
  .card-holder-title,
  .card-date-title {
    color: #bdbdbd;
    font-size: 0.7em;
  }
  .card-holder-name {
    font-size: 1.1em;
    font-weight: 600;
  }
  .card-date-col {
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }`;

export default Card;
