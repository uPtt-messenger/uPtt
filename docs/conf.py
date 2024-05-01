# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html
import os

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'uPtt'
copyright = '2024, uPtt'
author = 'CodingMan'

_script_path = os.path.dirname(os.path.abspath(__file__))

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = [
    'sphinx.ext.graphviz',
    'sphinx_sitemap',
]

templates_path = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']

language = 'zh_TW'

# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'alabaster'
html_static_path = [
    'CNAME',
    'robots.txt',
    '_static']

# -- GraphViz configuration ----------------------------------
graphviz_output_format = 'svg'

# -- Options for LaTeX output ------------------------------------------------
html_baseurl = 'https://uptt.cc/'
sitemap_url_scheme = "{link}"
