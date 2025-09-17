# AI in Web Programming Lab Notebooks

A collection of twelve weekly lab notebooks lives under `ai-web/labs`. Each notebook follows the same structure (objectives, learning outcomes, prerequisites, guided steps, validation checks with local curl commands, and homework extensions) while covering the specific topics from the course brief.

## Regenerating the notebooks

The notebooks can be regenerated locally using the helper script.

```bash
# Install the single dependency if it is not already available
pip install nbformat

# Generate or refresh the notebooks
python generate_ai_web_lab_notebooks.py
```

Running the script recreates the `ai-web/labs` directory and populates it with fresh notebook content. All commands are meant to be executed locally so that API keys remain protected on the backend.
