#!/bin/bash

# Linear Branch Strategy - Lesson Propagation Script
# Usage: ./propagate-changes.sh [starting-lesson]
# 
# Manually add your lesson branches here in order:
LESSONS=("main" "lesson-01-setup" "lesson-02-components-jsx" "lesson-03-basic-hooks-state" "lesson-04-events" "lesson-05-controlled-form" "lesson-06-project-organization" "lesson-07-data-fetching" "lesson-08-optimization-hooks" "lesson-09-advanced-state" "lesson-10-react-router" "lesson-11-deployment-security")

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting lesson propagation...${NC}"

# Function to propagate changes forward
propagate_forward() {
    local start_lesson=$1
    local start_index=-1
    
    # Find starting lesson index
    for i in "${!LESSONS[@]}"; do
        if [[ "${LESSONS[$i]}" == "$start_lesson" ]]; then
            start_index=$i
            break
        fi
    done
    
    if [ $start_index -eq -1 ]; then
        echo -e "${RED}❌ Lesson '$start_lesson' not found${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}📚 Propagating from $start_lesson forward...${NC}"
    
    # Propagate to subsequent lessons
    for ((i=start_index+1; i<${#LESSONS[@]}; i++)); do
        current_lesson="${LESSONS[$i]}"
        previous_lesson="${LESSONS[$((i-1))]}"
        
        echo -e "${YELLOW}🔄 Merging $previous_lesson into $current_lesson${NC}"
        
        git checkout "$current_lesson"
        
        # Check if merge will cause conflicts
        if git merge "$previous_lesson" --no-commit --no-ff 2>/dev/null; then
            git commit -m "Auto-propagate changes from $previous_lesson"
            echo -e "${GREEN}✅ Successfully merged into $current_lesson${NC}"
        else
            git merge --abort 2>/dev/null || true
            echo -e "${RED}❌ Merge conflict in $current_lesson - manual intervention required${NC}"
            echo -e "${YELLOW}💡 Run: git checkout $current_lesson && git merge $previous_lesson${NC}"
            break
        fi
    done
}

# Function to show lesson status
show_status() {
    echo -e "${GREEN}📊 Lesson Status:${NC}"
    for lesson in "${LESSONS[@]}"; do
        if git show-ref --verify --quiet refs/heads/"$lesson"; then
            last_commit=$(git log -1 --format="%h %s" "$lesson")
            echo -e "  ${GREEN}✓${NC} $lesson: $last_commit"
        else
            echo -e "  ${RED}✗${NC} $lesson: (doesn't exist)"
        fi
    done
}

# Function to validate all lesson branches exist
validate_branches() {
    local missing_branches=()
    
    for lesson in "${LESSONS[@]}"; do
        if [ "$lesson" != "main" ] && ! git show-ref --verify --quiet refs/heads/"$lesson"; then
            missing_branches+=("$lesson")
        fi
    done
    
    if [ ${#missing_branches[@]} -gt 0 ]; then
        echo -e "${RED}❌ Missing lesson branches:${NC}"
        for branch in "${missing_branches[@]}"; do
            echo -e "  ${RED}✗${NC} $branch"
        done
        echo -e "${YELLOW}💡 Please create these branches manually before running the script${NC}"
        exit 1
    fi
}

# Main script logic
case "${1:-help}" in
    "forward")
        validate_branches
        starting_lesson="${2:-main}"
        propagate_forward "$starting_lesson"
        ;;
    "status")
        show_status
        ;;
    "help"|*)
        echo "Linear Branch Strategy - Lesson Propagation Tool"
        echo ""
        echo "Usage:"
        echo "  ./propagate-changes.sh forward [lesson]  - Propagate changes forward from lesson"
        echo "  ./propagate-changes.sh status           - Show status of all lessons"
        echo ""
        echo "Examples:"
        echo "  ./propagate-changes.sh forward lesson-02-components"
        echo "  ./propagate-changes.sh status"
        echo ""
        echo "Workflow:"
        echo "  1. Make changes on any lesson branch"
        echo "  2. Run: ./propagate-changes.sh forward [that-lesson]"  
        echo "  3. Changes will merge forward through all subsequent lessons"
        echo ""
        echo "Note: Create lesson branches manually and add them to LESSONS array at top of script"
        ;;
esac

echo -e "${GREEN}✨ Done!${NC}"
