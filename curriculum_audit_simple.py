#!/usr/bin/env python3
"""
Comprehensive Curriculum Audit Report
Matches curriculum templates to official NZ topics for Years 10-12
"""

import json
import re
import sys

# Force UTF-8 output
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Read the official NZ topics
with open(r'C:\Users\Andy\free-nz-maths\phase\full year 10-12 topics.txt', 'r', encoding='utf-8') as f:
    official_topics_text = f.read()

# Read the curriculum file
with open(r'C:\Users\Andy\free-nz-maths\src\curriculumDataNew.json', 'r', encoding='utf-8') as f:
    curriculum_data = json.load(f)

# Parse official topics into structured format
def parse_official_topics(text):
    """Parse the official topics file into a structured dictionary"""
    topics = {10: {}, 11: {}, 12: {}}
    current_year = None
    current_section = None

    lines = text.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i].strip()

        # Detect year
        if 'year 10' in line.lower() or line.startswith('Here is full year 10'):
            current_year = 10
        elif 'year 11' in line.lower() or 'and year 11' in line.lower():
            current_year = 11
        elif 'year 12' in line.lower():
            current_year = 12

        # Detect sections (like "Numbers", "Operations", etc.)
        elif line and not line[0].isdigit() and line.isupper() == False and current_year and ':' not in line and len(line) < 60:
            if len(line) > 2 and not re.match(r'^[A-Z]{1,2}\.\d+$', line):
                current_section = line
                if current_year and current_section not in topics[current_year]:
                    topics[current_year][current_section] = []

        # Detect topic codes (like "A.1", "B.2", etc.)
        elif re.match(r'^[A-Z]{1,2}\.\d+$', line) and current_year:
            topic_code = line
            i += 1
            if i < len(lines):
                topic_name = lines[i].strip()
                if current_section:
                    topics[current_year].setdefault(current_section, []).append({
                        'code': f'Y{current_year}.{topic_code}',
                        'name': topic_name,
                        'section': current_section
                    })

        i += 1

    return topics

# Extract curriculum templates by year
def extract_curriculum_templates(data):
    """Extract all templates from the curriculum, organized by year"""
    templates = {10: [], 11: [], 12: []}

    for year_obj in data['years']:
        year = year_obj['year']
        if year in [10, 11, 12]:
            for skill in year_obj['skills']:
                skill_id = skill.get('id', 'UNKNOWN')
                skill_name = skill.get('name', 'Unknown')
                strand = skill.get('strand', 'Unknown')

                for template in skill.get('templates', []):
                    templates[year].append({
                        'template_id': template.get('id', 'UNKNOWN'),
                        'skill_id': skill_id,
                        'skill_name': skill_name,
                        'strand': strand,
                        'stem': template.get('stem', '')[:150]
                    })

    return templates

# Match templates to official topics using better keyword matching
def find_best_topic_match(template, official_topics, year):
    """Find the best matching official topic for a template"""
    skill_name = template['skill_name'].lower()
    skill_id = template['skill_id'].lower()
    stem = template['stem'].lower()

    best_match = None
    best_score = 0

    for section, topics in official_topics[year].items():
        for topic in topics:
            topic_name_lower = topic['name'].lower()
            score = 0

            # Specific keyword matching
            keywords_map = {
                'quadratic': ['quadratic', 'parabola', 'vertex'],
                'trig': ['sin', 'cos', 'tan', 'sine', 'cosine', 'tangent', 'trigonometric', 'trig'],
                'circle': ['circle', 'circumference', 'radius', 'diameter'],
                'compound': ['compound', 'interest'],
                'distance': ['distance', 'midpoint'],
                'gradient': ['gradient', 'slope'],
                'volume': ['volume', 'prism', 'cylinder', 'sphere', 'cone', 'pyramid'],
                'surface': ['surface', 'area'],
                'probability': ['probability', 'prob'],
                'statistics': ['statistics', 'mean', 'median', 'mode', 'quartile'],
                'similar': ['similar', 'similarity'],
                'congruent': ['congruent', 'congruence'],
                'polynomial': ['polynomial', 'expand', 'factorise'],
                'logarithm': ['log', 'logarithm', 'exponential'],
                'matrix': ['matrix', 'matrices'],
                'vector': ['vector'],
                'complex': ['complex', 'imaginary'],
                'calculus': ['differentiate', 'derivative', 'integral']
            }

            # Check for keyword matches
            for category, keywords in keywords_map.items():
                if any(kw in topic_name_lower for kw in keywords):
                    if any(kw in skill_name or kw in stem for kw in keywords):
                        score += 5

            # Generic word matching
            topic_words = set(re.findall(r'\w+', topic_name_lower))
            skill_words = set(re.findall(r'\w+', skill_name))
            common_words = topic_words & skill_words
            score += len(common_words)

            if score > best_score:
                best_score = score
                best_match = {
                    'topic': topic,
                    'score': score
                }

    if best_score >= 2:
        return best_match
    return None

# Generate report
def generate_report():
    print("=" * 100)
    print("COMPREHENSIVE CURRICULUM AUDIT REPORT")
    print("Matching NZ Curriculum Templates to Official Topics (Years 10-12)")
    print("=" * 100)
    print()

    official_topics = parse_official_topics(official_topics_text)
    curriculum_templates = extract_curriculum_templates(curriculum_data)

    all_matched = 0
    all_unmatched = 0
    all_missing = 0

    for year in [10, 11, 12]:
        print(f"\n{'=' * 100}")
        print(f"YEAR {year} ANALYSIS")
        print(f"{'=' * 100}\n")

        print(f"Total templates in curriculum: {len(curriculum_templates[year])}")

        # Count official topics
        total_official = sum(len(topics) for topics in official_topics[year].values())
        print(f"Total official NZ topics: {total_official}\n")

        # Match templates to topics
        print(f"\n{'-' * 100}")
        print("TEMPLATE -> OFFICIAL TOPIC MAPPING")
        print(f"{'-' * 100}\n")

        matched_templates = []
        unmatched_templates = []
        matched_topic_codes = set()

        for template in curriculum_templates[year]:
            match = find_best_topic_match(template, official_topics, year)
            if match:
                matched_templates.append((template, match))
                matched_topic_codes.add(match['topic']['code'])
                print(f"[MATCH] {template['template_id']}")
                print(f"  Skill: {template['skill_name']}")
                print(f"  -> Official Topic: {match['topic']['code']} - {match['topic']['name']}")
                print(f"  Section: {match['topic']['section']}")
                print()
            else:
                unmatched_templates.append(template)

        # Report unmatched templates
        if unmatched_templates:
            print(f"\n{'-' * 100}")
            print(f"TEMPLATES WITHOUT CLEAR MATCH ({len(unmatched_templates)} templates)")
            print(f"{'-' * 100}\n")

            for template in unmatched_templates:
                print(f"[NO MATCH] {template['template_id']}")
                print(f"  Skill: {template['skill_name']}")
                print(f"  Strand: {template['strand']}")
                print(f"  Stem: {template['stem']}")
                print()

        # Report missing topics (topics with no templates)
        print(f"\n{'-' * 100}")
        print(f"OFFICIAL NZ TOPICS WITH NO TEMPLATES")
        print(f"{'-' * 100}\n")

        missing_count = 0
        for section, topics in official_topics[year].items():
            section_missing = []
            for topic in topics:
                if topic['code'] not in matched_topic_codes:
                    section_missing.append(topic)
                    missing_count += 1

            if section_missing:
                print(f"\n{section}:")
                for topic in section_missing:
                    print(f"  - {topic['code']} - {topic['name']}")

        # Summary statistics
        print(f"\n{'-' * 100}")
        print(f"YEAR {year} SUMMARY")
        print(f"{'-' * 100}\n")
        match_pct = len(matched_templates)*100//max(1,len(curriculum_templates[year]))
        coverage_pct = len(matched_topic_codes)*100//max(1,total_official)
        print(f"Templates matched to official topics: {len(matched_templates)} / {len(curriculum_templates[year])} ({match_pct}%)")
        print(f"Templates without clear match: {len(unmatched_templates)}")
        print(f"Official topics covered: {len(matched_topic_codes)} / {total_official} ({coverage_pct}%)")
        print(f"Official topics missing templates: {missing_count}")
        print()

        all_matched += len(matched_templates)
        all_unmatched += len(unmatched_templates)
        all_missing += missing_count

    # Overall summary
    print(f"\n{'=' * 100}")
    print("OVERALL SUMMARY (Years 10-12)")
    print(f"{'=' * 100}\n")

    total_templates = sum(len(curriculum_templates[y]) for y in [10, 11, 12])
    total_official_all = sum(sum(len(topics) for topics in official_topics[y].values()) for y in [10, 11, 12])

    print(f"Total curriculum templates: {total_templates}")
    print(f"Total official NZ topics: {total_official_all}")
    print(f"Templates matched: {all_matched}")
    print(f"Templates unmatched: {all_unmatched}")
    print(f"Topics without templates: {all_missing}")
    print(f"Coverage gap: {all_missing} official topics need templates")
    print()
    print("RECOMMENDATIONS:")
    print("1. Create templates for all missing official topics")
    print("2. Update skill IDs to match official NZ curriculum codes (e.g., Y10.A.1, Y10.B.2)")
    print("3. Review unmatched templates and either:")
    print("   - Map them to existing official topics with better keywords")
    print("   - Remove them if they don't align with NZ curriculum")
    print()

if __name__ == '__main__':
    generate_report()
