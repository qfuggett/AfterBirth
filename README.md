# After Birth: A Postpartum Companion for New Parents

After Birth is an image-first guide designed to help new parents understand postpartum recovery—from the first hours in the hospital to the transition home.

Inspired by watching my sister navigate delivery, the project addresses the questions families may not know to ask: What does postpartum care include? What happens next, and how can my support person help?

Parents scan a QR code to access clear explanations grounded in official hospital and public-health resources. Google Gemma helps users ask questions in everyday language and navigate directly to relevant educational pages. Additional planned features help families prepare questions for nurses, save photographed handouts, understand discharge instructions, organize voice notes, and find nearby pediatricians and postpartum care.

The interface prioritizes illustrations, short explanations, optional audio, and deeper detail when needed. Essential safety information remains easy to find.

Built as a standalone consumer app, After Birth requires no hospital-system connection or clinician account. It supports communication with care teams and keeps original instructions distinguishable from AI-assisted explanations.

Our goal is to help parents feel more informed, supported, and confident during a vulnerable transition—using AI to make trusted information easier to access.

## Development

This project was built with [Lovable](https://lovable.dev). Continue developing it in the [Lovable editor](https://lovable.dev/projects/21ac18bb-ed87-4a46-927a-8de0e86bfe63).

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

AI features use Google Gemma (default model `gemma-4-31b-it`), configured with the `GEMMA_API_KEY` and optional `GEMMA_MODEL` environment variables.
