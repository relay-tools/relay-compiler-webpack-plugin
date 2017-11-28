import React from 'react';
import {Col, Grid, Row} from "react-bootstrap";

export default ({location}) => {
  return <Grid fluid>
    <Row>
      <Col xs={12}>
        <div className="heading-row" id="search-bar">
          <div className="search-box">
            <Row>
              <Col xs={12} sm={8} md={6} lg={2}>
                <h2>Page {location && location.pathname} Not Found</h2>
              </Col>
            </Row>
          </div>
        </div>
      </Col>
    </Row>
  </Grid>;
};
