import React from "react";
import { Stepper, Step, StepLabel, Button, Box } from "@mui/material";

const steps = ["Started", "Ongoing", "Completed"];

const ProgressTracker = ({ progress, onUpdate }) => {
  const activeStep = steps.indexOf(progress);

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{ my: 2 }}>
        {steps.map((label, idx) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default ProgressTracker;
