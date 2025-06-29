// go 
"use client"
import React from 'react';
import styled from 'styled-components';

const Card = () => {
  return (
    <StyledWrapper>
      <div className="card">
        <span className="text">Go!</span>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    width: 150px;
    height: 150px;
    background: #a53c3c;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-size: 3em;
    font-weight: 900;
    color: aliceblue;
    transition: all .5s ease-in-out;
  }

  .text {
    transition: all 0.3s ease-in-out;
  }

  .card:hover {
    box-shadow: 75px 75px 5px -20px #bf5e37, -75px 75px 5px -20px #d08432, -75px -75px 5px -20px #bf5e37 , 75px -75px 5px -20px #d08432;
    transform: rotate(-45deg);
  }

  .card:hover .text {
    transform: rotate(45deg);
  }`;

export default Card;
