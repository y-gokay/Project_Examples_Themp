// Scoring utilities
export function compare(op, left, right) {
    switch (op) {
        case '>':
            return left > right;
        case '>=':
            return left >= right;
        case '<':
            return left < right;
        case '<=':
            return left <= right;
        case '==':
            return left === right;
        case '!=':
            return left !== right;
        default:
            return false;
    }
}

export function calculateScoreBreakdown(app, scoringConfig) {
    const defaultConfig = {
        socialSecurity: {
            SSK: 5,
            'BAĞ-KUR': 20,
            'Emekli Sandığı': 10,
        },
        disabledMembersInFamily: {},
        houseHeatingSystem: {},
        socialAssistanceHistory: {},
        numberOfStudentsInFamily: [{ op: '>', value: 2, points: 20 }],
        familySize: [{ op: '>=', value: 4, points: 10 }],
        totalIncome: [],
        employeesNumberOfFamily: [],
        houseRentalFee: [],
        familyPensionAmount: [],
        chronicDisease: { true: 15, false: 0 },
        additionalIncome: { true: 0, false: 10 },
    };

    const config = scoringConfig || defaultConfig;
    const breakdown = [];
    let totalCalculated = 0;

    // String/enum alanlar için map uygulaması
    const stringFields = [
        'socialSecurity',
        'disabledMembersInFamily',
        'houseHeatingSystem',
        'socialAssistanceHistory',
    ];
    for (const field of stringFields) {
        const map = config[field];
        const value = app[field];
        let points = 0;

        if (
            map &&
            value != null &&
            Object.prototype.hasOwnProperty.call(map, value)
        ) {
            points = Number(map[value]) || 0;
            totalCalculated += points;
        }

        let label = '';
        if (field === 'socialSecurity') {
            label = `Sosyal Güvenlik (${value || '-'})`;
        } else if (field === 'disabledMembersInFamily') {
            label = `Engelli Üye (${value || 'Yok'})`;
        } else if (field === 'houseHeatingSystem') {
            label = `Isınma Sistemi (${value || '-'})`;
        } else if (field === 'socialAssistanceHistory') {
            label = `Sosyal Yardım (${value || 'Yok'})`;
        }

        breakdown.push({ label, points });
    }

    // Numeric rules arrays
    const numericFields = [
        'numberOfStudentsInFamily',
        'familySize',
        'totalIncome',
        'employeesNumberOfFamily',
        'houseRentalFee',
        'familyPensionAmount',
    ];
    for (const field of numericFields) {
        const rules = config[field];
        const value = app[field];
        let points = 0;

        if (Array.isArray(rules) && typeof value === 'number') {
            for (const rule of rules) {
                if (rule && compare(rule.op, value, rule.value)) {
                    const rulePoints = Number(rule.points) || 0;
                    points += rulePoints;
                    totalCalculated += rulePoints;
                }
            }
        }

        let label = '';
        if (field === 'numberOfStudentsInFamily') {
            const rule = rules && rules[0];
            if (rule) {
                label = `Öğrenci Sayısı (${value} ${rule.op} ${rule.value}${
                    points > 0 ? ' ✓' : ''
                })`;
            } else {
                label = `Öğrenci Sayısı (${value})`;
            }
        } else if (field === 'familySize') {
            const rule = rules && rules[0];
            if (rule) {
                label = `Aile Büyüklüğü (${value} ${rule.op} ${rule.value}${
                    points > 0 ? ' ✓' : ''
                })`;
            } else {
                label = `Aile Büyüklüğü (${value})`;
            }
        } else if (field === 'totalIncome') {
            label = `Toplam Gelir (${value.toLocaleString('tr-TR')} ₺)`;
        } else if (field === 'employeesNumberOfFamily') {
            label = `Çalışan Sayısı (${value})`;
        } else if (field === 'houseRentalFee') {
            label = `Kira Bedeli (${
                value ? value.toLocaleString('tr-TR') + ' ₺' : 'Ev Sahibi'
            })`;
        } else if (field === 'familyPensionAmount') {
            label = `Maaş Bedeli (${
                value ? value.toLocaleString('tr-TR') + ' ₺' : '-'
            })`;
        }

        breakdown.push({ label, points });
    }

    // Boolean maps
    const booleanFields = ['chronicDisease', 'additionalIncome'];
    for (const field of booleanFields) {
        const map = config[field];
        let points = 0;

        if (map != null && typeof app[field] === 'boolean') {
            const key = app[field] ? 'true' : 'false';
            if (Object.prototype.hasOwnProperty.call(map, key)) {
                points = Number(map[key]) || 0;
                totalCalculated += points;
            }
        }

        let label = '';
        if (field === 'chronicDisease') {
            label = `Kronik Hastalık (${app[field] ? 'Var' : 'Yok'})`;
        } else if (field === 'additionalIncome') {
            label = `Ek Gelir (${app[field] ? 'Var' : 'Yok'})`;
        }

        breakdown.push({ label, points });
    }

    return { items: breakdown, totalCalculated };
}

