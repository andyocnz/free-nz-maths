
import fs from 'fs';

fs.readFile('audit.json', 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading audit.json:", err);
        return;
    }

    const auditData = JSON.parse(data);
    const all_ids = [];
    const id_duplicates = [];
    const templates_with_issues = [];

    auditData.years.forEach(year => {
        if (year.skills) {
            year.skills.forEach(skill => {
                if (skill.templates) {
                    skill.templates.forEach(template => {
                        if (!template) {
                            console.error(`Found null template in skill ${skill.id}`);
                            return;
                        }

                        // Check for duplicate IDs
                        if (all_ids.includes(template.id)) {
                            id_duplicates.push(template.id);
                        } else {
                            all_ids.push(template.id);
                        }

                        // Check for problematic answer expressions
                        if (typeof template.answer === 'string' && template.answer.includes('+')) {
                            if (template.answer.includes("'")) {
                                templates_with_issues.push({
                                    id: template.id,
                                    reason: "Potential string concatenation in answer.",
                                    answer: template.answer
                                });
                            }
                        }

                        // Check for hardcoded answers that could be dynamic
                        if (template.params && Object.keys(template.params).length > 0 && !/([a-zA-Z_]+\(.*\))|(\w+\s*[\+\-\*\/]\s*\w+)/.test(template.answer) && !template.answer.includes('`')) {
                             const answerAsNumber = Number(template.answer);
                             if (!isNaN(answerAsNumber)) {
                                let isParamInAnswer = false;
                                for(const param in template.params) {
                                    if(template.answer.includes(param)) {
                                        isParamInAnswer = true;
                                        break;
                                    }
                                }
                                if(!isParamInAnswer) {
                                    templates_with_issues.push({
                                        id: template.id,
                                        reason: "Potentially hardcoded answer. The answer is a number but does not seem to use any parameters.",
                                        answer: template.answer
                                    });
                                }
                             }
                        }

                        // Check for inconsistent param definitions
                        if (template.params) {
                            for (const param in template.params) {
                                if (Array.isArray(template.params[param]) && template.params[param].length === 1) {
                                    templates_with_issues.push({
                                        id: template.id,
                                        reason: `Inconsistent parameter definition for '${param}'. It's an array with a single value.`,
                                        params: template.params
                                    });
                                }
                            }
                        }
                    });
                }
            });
        }
    });

    const redundant_nets_skill = auditData.years.find(y => y.year === 6).skills.find(s => s.id === 'Y6.G.NETS');
    if (redundant_nets_skill) {
        const redundant_nets = redundant_nets_skill.templates.filter(t => t.visualData && t.visualData.shape_type === 'cube');
        const redundant_nets_issue = {
            id: "Y6.G.NETS",
            reason: "Multiple templates for cube nets with identical answers and visuals.",
            templates: redundant_nets.map(t => t.id)
        };
        console.log("Redundant Templates:", redundant_nets_issue);
    }


    console.log("Duplicate Template IDs:", id_duplicates);
    console.log("Templates with other issues:", templates_with_issues);

    // Mathematical analysis
    const math_issues = [];
    auditData.years.forEach(year => {
        if (year.skills) {
            year.skills.forEach(skill => {
                if (skill.templates) {
                    skill.templates.forEach(template => {
                        switch(template.id) {
                            case 'Y6.N.FRACTIONS.T2': {
                                const num = template.params.num;
                                const den = template.params.den;
                                if (num[2] >= den[1]) {
                                    math_issues.push({
                                        id: template.id,
                                        reason: "Parameter issue: 'num' can be greater than or equal to 'den', leading to a nonsensical fraction of a group.",
                                        params: template.params
                                    });
                                }
                                break;
                            }
                            case 'Y8.G.COORDINATE_PLANE.T1': {
                                if (!template.answer.includes("sqrt")) {
                                    math_issues.push({
                                        id: template.id,
                                        reason: "The previous answer formula was incorrect for general points and the question stem was misleading. It has been updated to the correct distance formula.",
                                        new_answer: template.answer
                                    });
                                }
                                break;
                            }
                            case 'Y8.G.GEOMETRY.T1': {
                                const a = template.params.a;
                                const b = template.params.b;
                                if (a[1] + b[1] >= 180) {
                                    math_issues.push({
                                        id: template.id,
                                        reason: "Parameter issue: The sum of the two angles can be >= 180, making a triangle impossible.",
                                        params: template.params
                                    });
                                }
                                break;
                            }
                            case 'Y8.G.TRIG_RIGHT.T1':
                            case 'Y8.G.TRIG_RIGHT.T2': {
                                math_issues.push({
                                    id: template.id,
                                    reason: "Fundamental issue: `opp`, `adj`, and `hyp` are generated independently and do not form a valid right triangle. This needs a new parameter generation strategy.",
                                    params: template.params
                                });
                                break;
                            }
                             case 'Y9.A.QUADRATICS.T2': {
                                math_issues.push({
                                    id: template.id,
                                    reason: "Fundamental issue: The quadratic coefficients are generated randomly, which will usually result in a quadratic that is not factorable over integers.",
                                    params: template.params
                                });
                                break;
                            }
                        }
                    });
                }
            });
        }
    });
    console.log("Mathematical Issues:", math_issues);
});
