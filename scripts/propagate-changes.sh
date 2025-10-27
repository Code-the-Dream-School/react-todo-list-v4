#!/bin/bash

# Linear Branch Strategy - Lesson Propagation Script
# Usage: ./propagate-changes.sh [starting-lesson]
# 
# Manually add your lesson branches here in order:
LESSONS=("main" "01-setup" "02-components-jsx" "03-basic-hooks-state" "04-events" "05-controlled-form" "06-project-organization" "07-data-fetching" "08-optimization-hooks" "09-advanced-state" "10-react-router" "11-deployment-security")

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

# Function to create missing lesson branches
create_missing_branches() {
    echo -e "${YELLOW}🔍 Checking for missing branches...${NC}"
    
    for lesson in "${LESSONS[@]}"; do
        if [ "$lesson" != "main" ] && ! git show-ref --verify --quiet refs/heads/"$lesson"; then
            echo -e "${YELLOW}🆕 Creating missing branch: $lesson${NC}"
            
            # Find the previous existing branch to base this one on
            local base_branch="main"
            for i in "${!LESSONS[@]}"; do
                if [[ "${LESSONS[$i]}" == "$lesson" ]] && [ $i -gt 0 ]; then
                    local prev_lesson="${LESSONS[$((i-1))]}"
                    if git show-ref --verify --quiet refs/heads/"$prev_lesson"; then
                        base_branch="$prev_lesson"
                    fi
                    break
                fi
            done
            
            git checkout "$base_branch"
            git checkout -b "$lesson"
            echo -e "${GREEN}✅ Created $lesson from $base_branch${NC}"
        fi
    done
    
    echo -e "${GREEN}✅ All lesson branches verified/created${NC}"
}

# Main script logic
case "${1:-help}" in
    "forward")
        create_missing_branches
        starting_lesson="${2:-main}"
        propagate_forward "$starting_lesson"
        ;;
    "create-branches")
        create_missing_branches
        ;;
    "status")
        show_status
        ;;
    "help"|*)
        echo "Linear Branch Strategy - Lesson Propagation Tool"
        echo ""
        echo "Usage:"
        echo "  ./propagate-changes.sh forward [lesson]     - Propagate changes forward from lesson"
        echo "  ./propagate-changes.sh create-branches      - Create any missing lesson branches"
        echo "  ./propagate-changes.sh status               - Show status of all lessons"
        echo ""
        echo "Examples:"
        echo "  ./propagate-changes.sh forward 02-components-jsx"
        echo "  ./propagate-changes.sh create-branches"
        echo "  ./propagate-changes.sh status"
        echo ""
        echo "Workflow:"
        echo "  1. Make changes on any lesson branch"
        echo "  2. Run: ./propagate-changes.sh forward [that-lesson]"  
        echo "  3. Changes will merge forward through all subsequent lessons"
        echo ""
        echo "Note: Missing branches will be created automatically when using 'forward' command"
        ;;
esac

echo -e "${GREEN}✨ Done!${NC}"
