#!/usr/bin/env bash
# Quick test commands for Vidate backend

# Run all tests
run_all() {
  cd C:\Users\szabo\PycharmProjects\Vidate\backend
  python -m pytest tests/ -v
}

# Run tests with coverage
run_coverage() {
  cd C:\Users\szabo\PycharmProjects\Vidate\backend
  pip install pytest-cov 2>/dev/null
  python -m pytest tests/ --cov=. --cov-report=html --cov-report=term-missing
  echo "Coverage report generated: htmlcov/index.html"
}

# Run specific test file
run_file() {
  if [ -z "$1" ]; then
    echo "Usage: run_file <test_filename>"
    echo "Examples:"
    echo "  run_file test_auth.py"
    echo "  run_file test_user_operations.py"
    exit 1
  fi
  cd C:\Users\szabo\PycharmProjects\Vidate\backend
  python -m pytest tests/$1 -v
}

# Run specific test
run_test() {
  if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: run_test <test_file> <test_name>"
    echo "Example: run_test test_auth.py test_register_token_and_me"
    exit 1
  fi
  cd C:\Users\szabo\PycharmProjects\Vidate\backend
  python -m pytest tests/$1::$2 -v
}

# Quick test (fast, minimal output)
quick_test() {
  cd C:\Users\szabo\PycharmProjects\Vidate\backend
  python -m pytest tests/ -q
}

# Test with detailed output
verbose_test() {
  cd C:\Users\szabo\PycharmProjects\Vidate\backend
  python -m pytest tests/ -vv --tb=short
}

# Show test collection without running
list_tests() {
  cd C:\Users\szabo\PycharmProjects\Vidate\backend
  python -m pytest tests/ --collect-only -q
}

# Main menu
if [ -z "$1" ]; then
  echo "Vidate Backend Test Commands"
  echo "============================"
  echo ""
  echo "Usage: source test.sh <command>"
  echo ""
  echo "Commands:"
  echo "  run_all          - Run all 23 tests with verbose output"
  echo "  run_coverage     - Run tests with coverage report"
  echo "  run_file <file>  - Run tests from specific file"
  echo "  run_test <f> <t> - Run specific test (e.g., run_test test_auth.py test_register_token_and_me)"
  echo "  quick_test       - Run tests with minimal output"
  echo "  verbose_test     - Run with very detailed output"
  echo "  list_tests       - List all available tests"
  echo ""
  echo "Example:"
  echo "  source test.sh run_all"
  exit 0
fi

# Execute command
$@

