#!/bin/bash

# Script to check GitHub Copilot status
# Usage: ./check-copilot.sh

echo "================================================"
echo "GitHub Copilot Status Checker"
echo "================================================"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "   Install it from: https://cli.github.com/"
    exit 1
fi

echo "✅ GitHub CLI is installed"
echo ""

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI"
    echo "   Run: gh auth login"
    exit 1
fi

echo "✅ Authenticated with GitHub"
echo ""

# Check Copilot access
echo "Checking Copilot access..."
echo ""

COPILOT_STATUS=$(gh api /user/copilot/access 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ GitHub Copilot Access Information:"
    echo "$COPILOT_STATUS" | jq '.' 2>/dev/null || echo "$COPILOT_STATUS"
    echo ""
    
    # Check if user has access
    HAS_ACCESS=$(echo "$COPILOT_STATUS" | jq -r '.has_access' 2>/dev/null)
    
    if [ "$HAS_ACCESS" = "true" ]; then
        echo "🎉 You have access to GitHub Copilot!"
        echo ""
        echo "Next steps:"
        echo "1. Install Copilot extension in your IDE:"
        echo "   - VS Code: https://marketplace.visualstudio.com/items?itemName=GitHub.copilot"
        echo "   - JetBrains: https://plugins.jetbrains.com/plugin/17718-github-copilot"
        echo "2. Sign in to GitHub in your IDE"
        echo "3. Start coding to see suggestions!"
    else
        echo "❌ You don't have access to GitHub Copilot"
        echo ""
        echo "To get access:"
        echo "1. Go to: https://github.com/features/copilot"
        echo "2. Start a free trial or purchase a subscription"
        echo "3. Or ask your organization admin to enable it"
    fi
else
    echo "❌ Could not check Copilot status"
    echo "Error: $COPILOT_STATUS"
    echo ""
    echo "Possible reasons:"
    echo "1. Network connectivity issues"
    echo "2. GitHub API rate limit reached"
    echo "3. Authentication token expired (run: gh auth refresh)"
fi

echo ""
echo "================================================"
echo "For more information, see: COPILOT_STATUS.md"
echo "================================================"
