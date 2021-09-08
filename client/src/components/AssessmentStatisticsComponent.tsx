import React, {useState, useContext, useEffect, useRef} from "react";
import {Assessment} from "../model/Assessment";
import {RepositoryContext} from "../context/RepositoryContext";
import {AssessmentStatistics} from "../model/AssessmentStatistics";
import {Spinner, Text} from "@fluentui/react";
import * as d3 from "d3";
import {Selection} from "d3-selection";
import {Question} from "../model/Question";


interface AssessmentStatisticsComponentProps {
    id: string,
    savedAssessment: Assessment;
}

interface QuestionInfo {
    name: string,
    correct: number,
    skipped: number,
    incorrect: number,
}

export const AssessmentStatisticsComponent = (
    {id, savedAssessment}: AssessmentStatisticsComponentProps
) => {
    const [stats, setStats] = useState<AssessmentStatistics>();
    const [questions, setQuestions] = useState<{ [id: string]: Question }>();
    const scoreRef = useRef<SVGSVGElement | null>(null);
    const questionsRef = useRef<SVGSVGElement | null>(null);
    const repositoryContext = useContext(RepositoryContext);
    useEffect(() => {
        const fetchStats = async () => {
            if (repositoryContext === null) {
                return;
            }
            const newStats = await repositoryContext.getAssessmentStats(id);
            setStats(newStats);
        }
        const fetchQuestions = async () => {
            if (repositoryContext == null) {
                return;
            }
            const result: { [id: string]: Question } = {};
            for (let questionId of savedAssessment.questionIds) {
                result[questionId] = await repositoryContext.getQuestionById(questionId);
            }
            setQuestions(result);
        }
        fetchStats();
        fetchQuestions();
    }, [id, repositoryContext, savedAssessment])
    useEffect(() => {
        if (stats === undefined) {
            return;
        }
        const renderScoreChart = (svg: Selection<SVGSVGElement | null, unknown, null, any>) => {
            const height = 300;
            const width = 500;
            const margin = {top: 20, right: 30, bottom: 30, left: 40};
            const color = "steelblue";
            const data = stats.studentResponses.map(r => r.score);
            const minScore = Math.floor(Math.min(...data));
            const maxScore = Math.ceil(Math.max(...data) + 1);
            const bins = d3.bin().thresholds(d3.range(minScore, maxScore))(data);
            console.log(bins)
            const x = d3.scaleLinear()
                .domain([minScore, maxScore + 1])
                .range([margin.left, width - margin.right])
            const y = d3.scaleLinear()
                .domain([0, d3.max(bins, d => d.length) || 0]).nice()
                .range([height - margin.bottom, margin.top])



            const xAxis = (g: Selection<SVGGElement, any, any, any>) => {
                g
                    .attr("transform", `translate(0,${height - margin.bottom})`)
                    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
                    .call(g => g.append("text")
                        .attr("x", width - margin.right)
                        .attr("y", -4)
                        .attr("fill", "currentColor")
                        .attr("font-weight", "bold")
                        .attr("text-anchor", "end")
                        .text("Score"))
            }
            const yAxis = (g: Selection<SVGGElement, any, any, any>) => {
                const ticks = y.ticks().filter(tick => Number.isInteger(tick));
                const axis = d3.axisLeft(y).tickValues(ticks).tickFormat(d3.format('d')).ticks(height / 40);
                g
                    .attr("transform", `translate(${margin.left},0)`)
                    .call(axis)
                    .call(g => g.select(".domain").remove())
                    .call(g => g.select(".tick:last-of-type text").clone()
                        .attr("x", 4)
                        .attr("text-anchor", "start")
                        .attr("font-weight", "bold")
                        .text("Students"))
            }

            const plot = (g: Selection<SVGGElement, any, any, any>) => {
                g
                    .attr("fill", color)
                    .selectAll("rect")
                    .data(bins)
                    .join("rect")
                    .attr("x", d => x(d.x0 || 0) + 1)
                    .attr("width", d => Math.max(1, x(d.x1 || 0) - x(d.x0 || 0) - 1))
                    .attr("y", d => y(d.length))
                    .attr("height", d => y(0) - y(d.length));
            }

            svg.select<SVGGElement>(".x-axis").call(xAxis);
            svg.select<SVGGElement>(".y-axis").call(yAxis);
            svg.select<SVGGElement>(".plot-area").call(plot);

        }

        renderScoreChart(d3.select(scoreRef.current));

    }, [stats, savedAssessment])
    useEffect(() => {
        if (stats === undefined) {
            return;
        }
        const renderQuestionsChart = (svg: Selection<SVGSVGElement | null, unknown, null, any>) => {
            console.log(questions);
            if (!questions) {
                return;
            }
            const data: { [key: string]: QuestionInfo } = {};
            for (let response of stats.studentResponses) {
                for (let [questionId, value] of Object.entries(response.responses)) {
                    const question = questions[questionId];
                    if (!(questionId in data)) {
                        data[questionId] = {
                            name: question.name,
                            correct: 0,
                            skipped: savedAssessment.studentIds.length,
                            incorrect: 0,
                        }
                    }
                    if (value.chosenOption === question.answer) {
                        data[questionId].correct += 1;
                    } else {
                        data[questionId].incorrect += 1;
                    }
                    data[questionId].skipped -= 1;
                }
            }
            console.log(data);
            const series = d3.stack<QuestionInfo>()
                .keys(["correct", "skipped", "incorrect"])
                (Object.values(data));
            const margin = ({top: 30, right: 10, bottom: 0, left: 30});
            const width = 500;
            const height = savedAssessment.questionIds.length * 25 + margin.top + margin.bottom;
            const x = d3.scaleLinear()
                .domain([0, savedAssessment.studentIds.length])
                .range([margin.left, width - margin.right])
            const y = d3.scaleBand()
                .domain(Object.values(data).map(d => d.name))
                .range([margin.top, height - margin.bottom])
                .padding(0.08)

            const xAxis = (g: Selection<SVGGElement, any, any, any>) => {
                const ticks = x.ticks().filter(tick => Number.isInteger(tick));
                const axis = d3.axisTop(x).tickValues(ticks).tickFormat(d3.format('d'));
                g
                    .attr("transform", `translate(0,${margin.top})`)
                    .call(axis)
                    .call(g => g.selectAll(".domain").remove())
            }

            const yAxis = (g: Selection<SVGGElement, any, any, any>) => {
                g
                    .attr("transform", `translate(${width + margin.right},0)`)
                    .call(d3.axisRight(y).tickSizeOuter(0))
                    .call(g => g.selectAll(".domain").remove())
            }

            const plot = (g: Selection<SVGGElement, any, any, any>) => {
                g
                    .selectAll("g")
                    .data(series)
                    // .enter().append("g")
                    .join("g")
                    .attr("fill", d => {
                        console.log(d);
                        if (d.key === "correct") {
                            return "#59a14f";
                        }
                        if (d.key === "skipped") {
                            return "#bab0ab";
                        }
                        return "#e15759";
                    })
                    .selectAll("rect")
                    .data(d => d)
                    .join("rect")
                    .attr("x", d => x(d[0]))
                    .attr("y", (d, i) => y(d.data.name) || 0)
                    .attr("width", d => x(d[1]) - x(d[0]))
                    .attr("height", y.bandwidth())
            }

            svg.select<SVGGElement>(".q-x-axis").call(xAxis);
            svg.select<SVGGElement>(".q-y-axis").call(yAxis);
            svg.select<SVGGElement>(".q-plot-area").call(plot);
        }
        renderQuestionsChart(d3.select(questionsRef.current));
    }, [stats, questions, savedAssessment])
    if (repositoryContext === null || stats === undefined) {
        return <Spinner
            label="Loading statistics..."
        />;
    }
    return <>
        <Text variant="large">Scores</Text>
        <svg
            ref={scoreRef}
            style={{
                height: 300,
                width: "100%",
                marginRight: "0px",
                marginLeft: "0px",
            }}>
            <g className="plot-area"/>
            <g className="x-axis"/>
            <g className="y-axis"/>
        </svg>
        <Text variant="large">Correct answers per question</Text>
        <svg
            ref={questionsRef}
            style={{
                height: 500,
                width: "100%",
                marginRight: "0px",
                marginLeft: "0px",
            }}>
            <g className="q-plot-area"/>
            <g className="q-x-axis"/>
            <g className="q-y-axis"/>
        </svg>
    </>
}
