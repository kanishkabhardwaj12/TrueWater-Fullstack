# **App Name**: TrueWater Algae Insights

## Core Features:

- Image Upload & Comparison: Allows users to upload a photo of a water sample and view it side-by-side with a reference image of a clean water sample.
- Algae Content Detection: Leverages a large language model to analyze the uploaded image and identify the types and quantities of algae present in the sample. Generates classification objects (if algae is found) listing name and count.
- Algae Content Explanation: Connects to the Gemini API to provide detailed information and potential implications of the detected algal content.
- Historical Data Tracking: Stores sample data (date of test, location, image, algal content analysis, test number, testID) in a Firestore database to track water quality changes over time.
- Sample History Visualization: Presents a visual history of algae growth in a given water sample, utilizing data from the Firestore database, where an LLM may use a tool to retrieve necessary info.
- Live Map Integration: Displays a live map (focused on Delhi NCR) pinpointing the location of the water sample being tested and all historical samples stored in the Firestore database.

## Style Guidelines:

- Primary color: Light blue (#ADD8E6), evoking a sense of cleanliness and water.
- Background color: Very light blue (#F0F8FF), nearly white, for a clean, clinical feel.
- Accent color: Soft green (#90EE90), complementing blue and alluding to plant life and organic matter.
- Body and headline font: 'Inter', a sans-serif font for clear and modern readability.
- Use water-drop icons for location pins and scientific-themed icons for algae information.
- Divide content clearly with tabs or sections for image comparison, algae analysis, history, and map view.
- Employ subtle animations during data loading and transitions to enhance user experience.