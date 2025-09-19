#!/bin/bash

echo "🚀 SIH25 NATPAC Travel Survey App - GitHub Push Script"
echo "======================================================="
echo ""
echo "This script will help you push your complete project to GitHub."
echo ""
echo "📝 Steps to follow:"
echo ""
echo "1. First, create a new repository on GitHub:"
echo "   - Go to https://github.com/new"
echo "   - Repository name: sih25-natpac-travel-survey"
echo "   - Description: AI-Powered Comprehensive Travel Survey Solution for Kerala - Smart India Hackathon 2025"
echo "   - Make it PUBLIC to showcase your work"
echo "   - DO NOT initialize with README (we already have one)"
echo ""
read -p "Press ENTER after creating the repository..."

echo ""
echo "2. Enter your GitHub username:"
read GITHUB_USERNAME

echo ""
echo "Setting up remote repository..."
git remote add myrepo https://github.com/$GITHUB_USERNAME/sih25-natpac-travel-survey.git

echo ""
echo "3. Choose authentication method:"
echo "   1) HTTPS with Personal Access Token (Recommended)"
echo "   2) SSH (if you have SSH keys set up)"
read -p "Enter choice (1 or 2): " AUTH_CHOICE

if [ "$AUTH_CHOICE" = "1" ]; then
    echo ""
    echo "📌 To create a Personal Access Token:"
    echo "   - Go to https://github.com/settings/tokens"
    echo "   - Click 'Generate new token (classic)'"
    echo "   - Give it a name like 'SIH25 Push'"
    echo "   - Select scopes: repo (all)"
    echo "   - Generate and copy the token"
    echo ""
    read -p "Enter your Personal Access Token: " -s PAT
    echo ""
    
    # Update remote with PAT
    git remote set-url myrepo https://$GITHUB_USERNAME:$PAT@github.com/$GITHUB_USERNAME/sih25-natpac-travel-survey.git
    
elif [ "$AUTH_CHOICE" = "2" ]; then
    git remote set-url myrepo git@github.com:$GITHUB_USERNAME/sih25-natpac-travel-survey.git
fi

echo ""
echo "📤 Pushing to GitHub..."
git push -u myrepo main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Your project has been pushed to GitHub!"
    echo ""
    echo "🎉 Your repository is now available at:"
    echo "   https://github.com/$GITHUB_USERNAME/sih25-natpac-travel-survey"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Add a nice repository banner/image"
    echo "   2. Update the README with your contact details"
    echo "   3. Add topics/tags: sih2025, natpac, kerala, travel-survey, machine-learning, gps-tracking"
    echo "   4. Consider adding a LICENSE file"
    echo "   5. Enable GitHub Pages for the web dashboard"
    echo ""
    echo "🏆 Good luck with Smart India Hackathon 2025!"
else
    echo ""
    echo "❌ Push failed. Please check your credentials and try again."
    echo "Common issues:"
    echo "- Make sure the repository exists on GitHub"
    echo "- Check your Personal Access Token has 'repo' permissions"
    echo "- Ensure you're connected to the internet"
fi

echo ""
echo "📊 Repository Statistics:"
echo "- Total files: $(git ls-files | wc -l)"
echo "- Total commits: $(git rev-list --count HEAD)"
echo "- Project size: $(du -sh . | cut -f1)"
echo ""