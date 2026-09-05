.PHONY: check test
check test:
	uv run --with playwright==1.62.0 python3 showcase/tests/run_all.py
