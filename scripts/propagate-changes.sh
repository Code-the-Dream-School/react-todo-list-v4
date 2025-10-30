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

# Function to push branches to remote
push_remote_branches() {
    local push_from_lesson=${1:-"main"}
    local start_index=-1
    
    # Find starting lesson index
    for i in "${!LESSONS[@]}"; do
        if [[ "${LESSONS[$i]}" == "$push_from_lesson" ]]; then
            start_index=$i
            break
        fi
    done
    
    if [ $start_index -eq -1 ]; then
        echo -e "${RED}❌ Lesson '$push_from_lesson' not found${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}🚀 Pushing branches to remote starting from $push_from_lesson...${NC}"
    
    # Push from specified lesson forward
    for ((i=start_index; i<${#LESSONS[@]}; i++)); do
        current_lesson="${LESSONS[$i]}"
        
        if git show-ref --verify --quiet refs/heads/"$current_lesson"; then
            echo -e "${YELLOW}📤 Pushing $current_lesson to remote...${NC}"
            
            if git push origin "$current_lesson" 2>/dev/null; then
                echo -e "${GREEN}✅ Successfully pushed $current_lesson${NC}"
            else
                echo -e "${RED}❌ Failed to push $current_lesson - may need force push or manual intervention${NC}"
                echo -e "${YELLOW}💡 Try: git push --force-with-lease origin $current_lesson${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  Branch $current_lesson doesn't exist locally, skipping...${NC}"
        fi
    done
}

# Function to propagate changes forward
propagate_forward() {
    local start_lesson=$1
    local should_push=$2
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
            
            # Push to remote if requested
            if [ "$should_push" = "true" ]; then
                echo -e "${YELLOW}📤 Pushing $current_lesson to remote...${NC}"
                if git push origin "$current_lesson" 2>/dev/null; then
                    echo -e "${GREEN}✅ Successfully pushed $current_lesson${NC}"
                else
                    echo -e "${RED}❌ Failed to push $current_lesson${NC}"
                    echo -e "${YELLOW}💡 Try: git push --force-with-lease origin $current_lesson${NC}"
                fi
            fi
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
            
            # Check remote status
            remote_status=""
            if git ls-remote --heads origin "$lesson" | grep -q "$lesson"; then
                local_commit=$(git rev-parse "$lesson")
                remote_commit=$(git ls-remote origin "$lesson" | cut -f1)
                if [ "$local_commit" = "$remote_commit" ]; then
                    remote_status="${GREEN}[synced]${NC}"
                else
                    remote_status="${YELLOW}[diverged]${NC}"
                fi
            else
                remote_status="${RED}[no remote]${NC}"
            fi
            
            echo -e "  ${GREEN}✓${NC} $lesson: $last_commit $remote_status"
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
        should_push="false"
        
        # Check for --push flag
        if [[ "$3" == "--push" ]] || [[ "$2" == "--push" ]]; then
            should_push="true"
            # If --push is second argument, use main as starting lesson
            if [[ "$2" == "--push" ]]; then
                starting_lesson="main"
            fi
        fi
        
        propagate_forward "$starting_lesson" "$should_push"
        ;;
    "push")
        push_from_lesson="${2:-main}"
        push_remote_branches "$push_from_lesson"
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
        echo "  ./propagate-changes.sh forward [lesson] [--push]  - Propagate changes forward from lesson"
        echo "  ./propagate-changes.sh push [lesson]              - Push branches to remote from lesson forward"
        echo "  ./propagate-changes.sh create-branches            - Create any missing lesson branches"
        echo "  ./propagate-changes.sh status                     - Show status of all lessons"
        echo ""
        echo "Examples:"
        echo "  ./propagate-changes.sh forward 02-components-jsx"
        echo "  ./propagate-changes.sh forward 02-components-jsx --push"
        echo "  ./propagate-changes.sh push 03-basic-hooks-state"
        echo "  ./propagate-changes.sh create-branches"
        echo "  ./propagate-changes.sh status"
        echo ""
        echo "Workflow:"
        echo "  1. Make changes on any lesson branch"
        echo "  2. Run: ./propagate-changes.sh forward [that-lesson] [--push]"  
        echo "  3. Changes will merge forward through all subsequent lessons"
        echo "  4. Use --push flag to automatically push to remote after each merge"
        echo ""
        echo "Note: Missing branches will be created automatically when using 'forward' command"
        echo "      Remote status is shown in status command: [synced], [diverged], [no remote]"
        ;;
esac

echo -e "${GREEN}✨ Done!${NC}"
